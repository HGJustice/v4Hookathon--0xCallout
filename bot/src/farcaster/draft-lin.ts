import { env } from "../lib/env.js";

/**
 * ASSUMPTION: the form takes `deadline` as an ISO timestamp.
 * Confirm against parseDeadlineParam in lib/markets/create.ts before testing.
 */
export function buildDraftLink(claim: string, deadline: Date): string {
  const params = new URLSearchParams({
    title: claim,
    deadline: deadline.toISOString(),
  });
  return `${env.APP_URL}/create?${params.toString()}`;
}