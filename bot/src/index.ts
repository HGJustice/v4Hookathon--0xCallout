import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { env } from "./lib/env.js";
import { isValidSignature } from "./webhook/verify.js";
import { recordCast } from "./webhook/record-cast.js";
import { handleMention, type MentionCast } from "./webhook/handle-mention.js";
import { startFactoryWatcher } from "./chain/watcher.js";

const app = new Hono();

app.get("/health", (c) => c.json({ ok: true }));

app.post("/webhook", async (c) => {
  const rawBody = await c.req.text();
  const signature = c.req.header("x-neynar-signature");

  if (!isValidSignature(rawBody, signature, env.NEYNAR_WEBHOOK_SECRET)) {
    return c.json({ error: "invalid signature" }, 401);
  }

  const event = JSON.parse(rawBody);

  if (event.type === "cast.created") {
    const cast = event.data as MentionCast;
    try {
      const isNew = await recordCast(cast.hash, cast.author.fid);
      if (isNew) await handleMention(cast);
      console.log(isNew ? "handled" : "duplicate", cast.hash);
    } catch (error) {
      // Log and still return 200, so Neynar doesn't retry a cast that will keep failing.
      console.error("failed to handle mention", cast.hash, error);
    }
  }

  return c.json({ ok: true });
});
startFactoryWatcher();
serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`bot listening on http://localhost:${info.port}`);
});