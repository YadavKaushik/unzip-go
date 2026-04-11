import { assertEquals } from "jsr:@std/assert";

import { buildApiErrorPayload, normalizeProviderCode } from "./index.ts";

Deno.test("normalizeProviderCode maps JILI aliases to the allowed provider code", () => {
  assertEquals(normalizeProviderCode("JILI"), "JILIGAMING");
  assertEquals(normalizeProviderCode(" jiligaming "), "JILIGAMING");
});

Deno.test("buildApiErrorPayload converts upstream provider 403 into a client-safe payload", () => {
  const payload = buildApiErrorPayload(
    403,
    {
      error: "Provider not allowed for your account",
      provider_code: "TB Chess",
      allowed_providers: ["JILIGAMING"],
    },
    "TB Chess",
    "TB Chess",
  );

  assertEquals(payload.code, 403);
  assertEquals(payload.msg, "TB Chess is not enabled on the current gaming account. Available provider: JILIGAMING");

  if (!("data" in payload) || !payload.data) {
    throw new Error("Expected provider metadata in payload");
  }

  assertEquals(payload.data.allowedProviders, ["JILIGAMING"]);
});

Deno.test("buildApiErrorPayload preserves generic upstream failures", () => {
  const payload = buildApiErrorPayload(500, { error: "Unexpected upstream error" }, "JILI", "JILIGAMING");

  assertEquals(payload.code, 8);
  assertEquals(payload.msg, "API Error (500)");
});