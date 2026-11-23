import { env } from "../lib/env.js";

const NEYNAR_CAST_URL = "https://api.neynar.com/v2/farcaster/cast";

/** Posts a reply to a cast as the bot. Returns the new cast's hash. */
export async function replyToCast(parentHash: string, text: string): Promise<string> {
  const res = await fetch(NEYNAR_CAST_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": env.NEYNAR_API_KEY,
    },
    body: JSON.stringify({
      signer_uuid: env.BOT_SGINER_UUID,
      text,
      parent: parentHash,
    }),
  });

  if (!res.ok) {
    throw new Error(`Neynar reply failed: ${res.status} ${await res.text()}`);
  }
  const body = (await res.json()) as { success: boolean; cast: { hash: string } };
  if (!body.success) throw new Error("Neynar reply returned success=false");
  return body.cast.hash;
}