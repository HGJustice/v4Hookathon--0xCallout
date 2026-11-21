import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { env } from "./lib/env.js";
import { isValidSignature } from "./webhook/verify.js";
import { recordCast } from "./webhook/record-cast.js";

const app = new Hono();

app.get("/health", (c) => c.json({ ok: true }));

app.post("/webhook", async (c) => {
    // Read the raw body first: the signature is computed over these exact bytes.
    const rawBody = await c.req.text();
    const signature = c.req.header("x-neynar-signature");

    if (!isValidSignature(rawBody, signature, env.NEYNAR_WEBHOOK_SECRET)) {
        return c.json({ error: "invalid signature" }, 401);
    }

    const event = JSON.parse(rawBody);

    if (event.type === "cast.created") {
        const isNew = await recordCast(event.data.hash, event.data.author.fid);
        console.log(isNew ? "recorded" : "duplicate", event.data.hash);
    }

    return c.json({ ok: true });
});

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
    console.log(`bot listening on http://localhost:${info.port}`);
});