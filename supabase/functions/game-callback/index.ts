import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const API_SECRET = Deno.env.get("HYPER_API_SECRET") || "";
const PLAYER_PREFIX = "43becd";

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-signature",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();
    const post = JSON.parse(rawBody);

    const serialNumber = post.serial_number || "";
    const memberAccount = post.member_account || "";
    const betAmount = Math.round(parseFloat(post.bet_amount || "0") * 100) / 100;
    const winAmount = Math.round(parseFloat(post.win_amount || "0") * 100) / 100;
    const gameUid = post.game_uid || "";
    const gameRound = post.game_round || "";
    const gameName = post.game_name || gameUid;
    const currency = (post.currency || "INR").toUpperCase();

    // Verify HMAC signature
    const signature = req.headers.get("x-signature") || "";
    if (signature && API_SECRET) {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw", encoder.encode(API_SECRET),
        { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
      );
      const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
      const expectedSig = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
      if (signature !== expectedSig) {
        console.warn("Signature mismatch");
      }
    }

    // Skip no-op
    if (betAmount === 0 && winAmount === 0) {
      return new Response(JSON.stringify({ code: 0, msg: "OK (no-op)" }), { headers: corsHeaders });
    }

    // Extract user ID from member account
    let cleanAccount = memberAccount.trim();
    if (cleanAccount.startsWith(PLAYER_PREFIX)) {
      cleanAccount = cleanAccount.slice(PLAYER_PREFIX.length);
    }

    // Connect to Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find user by the cleanAccount (partial UUID)
    // We stored memberAccount as PLAYER_PREFIX + first 10 chars of UUID without dashes
    const { data: wallets, error: walletErr } = await supabase
      .from("wallets")
      .select("user_id, balance, bonus_balance");

    if (walletErr || !wallets) {
      return new Response(JSON.stringify({ code: 1, msg: "DB Error" }), { status: 500, headers: corsHeaders });
    }

    // Find matching wallet by UUID prefix
    const matchedWallet = wallets.find(w => {
      const shortId = w.user_id.replace(/-/g, "").slice(0, 10);
      return shortId === cleanAccount;
    });

    if (!matchedWallet) {
      return new Response(JSON.stringify({ code: 1, msg: "User not found" }), { headers: corsHeaders });
    }

    const userId = matchedWallet.user_id;
    const currentBalance = Number(matchedWallet.balance);
    const balanceAfterBet = currentBalance - betAmount;
    const newBalance = Math.round((balanceAfterBet + winAmount) * 100) / 100;

    if (balanceAfterBet < 0) {
      return new Response(
        JSON.stringify({ code: 1, msg: "Insufficient balance", balance: currentBalance }),
        { headers: corsHeaders }
      );
    }

    // Update balance
    const { error: updateErr } = await supabase
      .from("wallets")
      .update({ balance: newBalance })
      .eq("user_id", userId);

    if (updateErr) {
      return new Response(JSON.stringify({ code: 9, msg: "Balance update failed" }), { status: 500, headers: corsHeaders });
    }

    console.log(`CALLBACK OK | User: ${userId} | Game: ${gameName} | Bet: ${betAmount} | Win: ${winAmount} | Balance: ${currentBalance} -> ${newBalance}`);

    return new Response(
      JSON.stringify({
        code: 0,
        msg: "OK",
        balance: newBalance,
        data: {
          user_id: userId,
          game: gameName,
          bet: betAmount,
          win: winAmount,
          balance_before: currentBalance,
          balance_after: newBalance,
          currency,
        },
      }),
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error("Callback error:", err);
    return new Response(
      JSON.stringify({ code: 9, msg: "Internal error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
