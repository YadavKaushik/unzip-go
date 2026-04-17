import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+\d{10,15}$/;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const payload = await req.json().catch(() => null);
    if (!payload || typeof payload !== "object") return json({ error: "Invalid request body" }, 400);

    const email = typeof payload.email === "string" ? payload.email.trim() : "";
    const phone = typeof payload.phone === "string" ? payload.phone.trim() : "";
    const password = typeof payload.password === "string" ? payload.password : "";
    const referral = typeof payload.referral === "string" ? payload.referral.trim() : "";

    if (!password || password.length < 6) return json({ error: "Password must be at least 6 characters" }, 400);
    const flowCount = Number(Boolean(email)) + Number(Boolean(phone));
    if (flowCount !== 1) return json({ error: "Use either email or phone for registration" }, 400);
    if (email && !emailRegex.test(email)) return json({ error: "Enter a valid email address" }, 400);
    if (phone && !phoneRegex.test(phone)) return json({ error: "Enter a valid phone number" }, 400);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) return json({ error: "Server configuration error" }, 500);

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const isPhoneFlow = Boolean(phone);

    // Pass referral via raw_user_meta_data so handle_new_user trigger picks it up
    const userMeta: Record<string, unknown> = {};
    if (isPhoneFlow) userMeta.phone = phone;
    if (referral) userMeta.referral = referral;

    const createUserResult = isPhoneFlow
      ? await admin.auth.admin.createUser({
          phone, password, phone_confirm: true, user_metadata: userMeta,
        })
      : await admin.auth.admin.createUser({
          email, password, email_confirm: true, user_metadata: userMeta,
        });

    const { data, error } = createUserResult;

    if (error || !data.user) {
      const message = error?.message || "Registration failed";
      if (/already|exists|duplicate/i.test(message)) {
        return json({
          error: isPhoneFlow
            ? "This number is already registered. Please login instead."
            : "This email is already registered. Please login instead.",
        }, 409);
      }
      return json({ error: message }, 400);
    }

    // The handle_new_user trigger already created the profile + wallet.
    // If admin.createUser bypassed the trigger's metadata read, set referrer_id explicitly.
    if (referral) {
      const { data: refProfile } = await admin
        .from("profiles").select("user_id").eq("invitation_code", referral).maybeSingle();
      if (refProfile?.user_id && refProfile.user_id !== data.user.id) {
        await admin.from("profiles")
          .update({ referrer_id: refProfile.user_id })
          .eq("user_id", data.user.id);
      }
    }

    if (isPhoneFlow) {
      await admin.from("profiles").update({ phone }).eq("user_id", data.user.id);
    }

    return json({
      user: { id: data.user.id, email: data.user.email ?? null, phone: data.user.phone ?? null },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return json({ error: message }, 500);
  }
});
