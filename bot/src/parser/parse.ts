export type ParseResult =
  | { ok: true; claim: string; deadline: Date }
  | { ok: false; reason: string };

const MIN_CLAIM_LENGTH = 10;
const MIN_LEAD_TIME_MS = 24 * 60 * 60 * 1000; // the contract's intended 1-day minimum

export function parseCast(text: string, now = new Date()): ParseResult {
  // Remove the mention, then match "<claim> by YYYY-MM-DD".
  const body = text.replace(/@\S+/g, "").trim();
  const match = body.match(/^(.*)\s+by\s+(\d{4}-\d{2}-\d{2})$/i);
  if (!match) return { ok: false, reason: "Use the form: <claim> by YYYY-MM-DD" };

  const claim = match[1]!.trim();
  if (claim.length < MIN_CLAIM_LENGTH) {
    return { ok: false, reason: `The claim needs at least ${MIN_CLAIM_LENGTH} characters.` };
  }

  // End of that day, in UTC.
  const iso = match[2]!;
  const deadline = new Date(`${iso}T23:59:59Z`);
  if (Number.isNaN(deadline.getTime()) || deadline.toISOString().slice(0, 10) !== iso) {
    return { ok: false, reason: "That date isn't valid." };
  }
  if (deadline.getTime() - now.getTime() < MIN_LEAD_TIME_MS) {
    return { ok: false, reason: "The deadline must be at least 24 hours away." };
  }

  return { ok: true, claim, deadline };
}