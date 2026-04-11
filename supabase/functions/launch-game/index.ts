import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const API_URL = "https://api.hyperapi.in/api/game-api";
const PLAYER_PREFIX = "43becd";
const CURRENCY = "INR";
const EXIT_URL = "https://85clubs.space/";

type LaunchApiResult = {
  success?: boolean;
  game_launch_url?: string;
  msg?: string;
  error?: string;
  provider_code?: string;
  allowed_providers?: unknown[];
  [key: string]: unknown;
};

const PROVIDER_ALIASES: Record<string, string> = {
  JILI: "JILIGAMING",
  JILIGAMING: "JILIGAMING",
  "TB CHESS": "TB Chess",
  TB_CHESS: "TB Chess",
  BGAMING: "BGaming",
  INOUT: "InOut",
};

export const normalizeProviderCode = (providerCode?: string | null) => {
  const rawProvider = (providerCode || "").trim();

  if (!rawProvider) {
    return "";
  }

  const aliasKey = rawProvider.replace(/\s+/g, " ").toUpperCase();
  return PROVIDER_ALIASES[aliasKey] ?? rawProvider;
};

export const buildApiErrorPayload = (
  status: number,
  result: LaunchApiResult,
  requestedProvider: string,
  normalizedProvider: string,
) => {
  const allowedProviders = Array.isArray(result.allowed_providers)
    ? result.allowed_providers.filter(
        (provider): provider is string => typeof provider === "string" && provider.length > 0,
      )
    : [];

  if (status === 403 && allowedProviders.length > 0) {
    const providerLabel = requestedProvider || normalizedProvider || (typeof result.provider_code === "string" ? result.provider_code : "this provider");

    return {
      code: 403,
      msg: `${providerLabel} is not enabled on the current gaming account. Available provider: ${allowedProviders.join(", ")}`,
      debug: result,
      data: {
        requestedProvider: providerLabel,
        normalizedProvider,
        allowedProviders,
      },
    };
  }

  return {
    code: 8,
    msg: `API Error (${status})`,
    debug: result,
  };
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const handler = async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const API_TOKEN = Deno.env.get("HYPER_API_TOKEN");
    const API_SECRET = Deno.env.get("HYPER_API_SECRET");

    if (!API_TOKEN || !API_SECRET) {
      return jsonResponse({ code: 9, msg: "API credentials not configured" }, 500);
    }

    // Validate JWT
    const authHeader = req.headers.get("Authorization") || "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return jsonResponse({ code: 4, msg: "Unauthorized" }, 401);
    }

    // Parse request body
    const body = await req.json().catch(() => null);
    const gameCode = typeof body?.gameCode === "string" ? body.gameCode.trim() : "";
    const gameName = typeof body?.gameName === "string" ? body.gameName.trim() : "";
    const requestedProviderCode = typeof body?.providerCode === "string" ? body.providerCode.trim() : "";
    const providerCode = normalizeProviderCode(requestedProviderCode);

    if (!gameCode) {
      return jsonResponse({ code: 7, msg: "Missing gameCode" });
    }

    // Get user wallet balance
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle();

    if (walletError || !wallet) {
      return jsonResponse({ code: 404, msg: "Wallet not found" });
    }

    const totalBalance = Number(wallet.balance || 0);

    if (totalBalance <= 0) {
      return jsonResponse({ code: 403, msg: "Insufficient balance", data: { balance: totalBalance } });
    }

    // Build callback URL
    const callbackUrl = `${supabaseUrl}/functions/v1/game-callback`;
    const memberAccount = PLAYER_PREFIX + user.id.replace(/-/g, "").slice(0, 10);

    // Call HyperAPI
    const apiPayload = {
      action: "launch",
      game_uid: gameCode,
      game_name: gameName || "",
      provider_code: providerCode || "",
      credit_amount: totalBalance,
      member_account: memberAccount,
      currency: CURRENCY,
      callback_url: callbackUrl,
      home_url: EXIT_URL,
      branding: true,
    };

    const apiResponse = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_TOKEN}`,
        "X-API-Secret": API_SECRET,
      },
      body: JSON.stringify(apiPayload),
    });

    const rawApiResponse = await apiResponse.text();
    let result: LaunchApiResult = {};

    try {
      result = rawApiResponse ? JSON.parse(rawApiResponse) : {};
    } catch {
      result = { error: rawApiResponse || "Invalid API response" };
    }

    console.log("HyperAPI response:", apiResponse.status, JSON.stringify(result));

    if (!apiResponse.ok) {
      return jsonResponse(
        buildApiErrorPayload(apiResponse.status, result, requestedProviderCode, providerCode),
      );
    }

    if (result.success && result.game_launch_url) {
      let launchUrl = result.game_launch_url.trim();
      if (!launchUrl.startsWith("http://") && !launchUrl.startsWith("https://")) {
        launchUrl = "https://" + launchUrl.replace(/^\/+/, "");
      }

      return jsonResponse({
        code: 0,
        msg: "Success",
        data: {
          url: launchUrl,
          returnType: "1",
          balance: totalBalance,
          currency: CURRENCY,
        },
      });
    }

    return jsonResponse({ code: -1, msg: result.msg || result.error || "Game Launch Failed", debug: result });
  } catch (err) {
    console.error("Launch game error:", err);
    return jsonResponse({ code: 9, msg: "Internal error", error: String(err) }, 500);
  }
};

if (import.meta.main) {
  Deno.serve(handler);
}

export default handler;
