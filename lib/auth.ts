export const SESSION_COOKIE = "pa_session";

async function hmacHex(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Returns null when no passcode is configured (auth disabled). */
export async function expectedSessionToken(): Promise<string | null> {
  const passcode = process.env.APP_PASSCODE;
  if (!passcode) return null;
  return hmacHex("pa-session", passcode);
}
