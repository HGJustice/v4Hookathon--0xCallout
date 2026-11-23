import { prisma } from "../db/client.js";
import { env } from "../lib/env.js";
import { replyToCast } from "../farcaster/reply.js";
import { parseCast } from "../parser/parse.js";
import { buildDraftLink } from "../farcaster/draft-lin.js";
import { markNotified } from "../db/notification.js";

const JOIN_WINDOW_MS = 12 * 60 * 60 * 1000; // opponent has 12 hours to deposit

export type MentionCast = {
  hash: string;
  text: string;
  author: { fid: number };
  mentioned_profiles: { fid: number }[];
};

export async function handleMention(cast: MentionCast): Promise<void> {
  const opponent = cast.mentioned_profiles.find((p) => p.fid !== env.BOT_FID);
  if (!opponent) {
    await replyToCast(cast.hash, "Tag the person you're debating with too, e.g. @opponent.");
    return;
  }

  const parsed = parseCast(cast.text);
  if (!parsed.ok) {
    await replyToCast(cast.hash, parsed.reason);
    return;
  }

  const now = Date.now();
  const debate = await prisma.debate.create({
    data: {
      castHash: cast.hash,
      challengerFid: cast.author.fid,
      opponentFid: opponent.fid,
      claim: parsed.claim,
      marketDeadline: BigInt(Math.floor(parsed.deadline.getTime() / 1000)),
      joinDeadline: BigInt(Math.floor((now + JOIN_WINDOW_MS) / 1000)),
      status: "draft",
    },
  });

  const link = buildDraftLink(parsed.claim, parsed.deadline);
  const sent = await markNotified(debate.id, "draft_link", cast.hash);
  if (sent) {
    await replyToCast(
      cast.hash,
      `Draft market ready: ${link}\nDeadline: end of day UTC. Both of you deposit to open it.`,
    );
  }
}