import { createHmac, timingSafeEqual } from "node:crypto";

// Neynar signs the raw request body with your webhook secret (HMAC-SHA512, hex).
// Check the header name and algorithm against Neynar's current webhook docs.
export function isValidSignature(rawBody: string, signature: string | undefined, secret: string): boolean {
  if (!signature) return false;

  const expected = createHmac("sha512", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);

  // timingSafeEqual throws on different lengths, so check length first.
  return a.length === b.length && timingSafeEqual(a, b);
}