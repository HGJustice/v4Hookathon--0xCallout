import { parseEther } from "viem";
// Relative imports with extensions, so `npm test` can run this file directly under Node.
import { FEES } from "../protocol.ts";
import { getDeadlineProblem } from "./market.ts";

/** MarketplaceFactory rejects shorter titles (TitleNotLongEnough). */
export const TITLE_MIN = 10;
/** Not a contract limit: keeps a question readable on a card. */
export const TITLE_MAX = 140;

/** The least a market can be created with, and the part of it the protocol keeps. */
export const MIN_SEED = parseEther(FEES.marketSetup);
export const PROTOCOL_FEE = parseEther(FEES.protocol);
/** Kept back from the balance when checking the deposit, for the network fee. */
export const GAS_RESERVE = parseEther("0.0005");

export const DEADLINE_PRESETS = [
  { id: "day", label: "1 day", days: 1 },
  { id: "week", label: "1 week", days: 7 },
  { id: "month", label: "1 month", days: 30 },
] as const;

/** ETH amounts offered as shortcuts; the first is the minimum. */
export const SEED_PRESETS = [FEES.marketSetup, "0.01", "0.05", "0.1"] as const;

/** A date as the value of an `<input type="datetime-local">`: local time, to the minute. */
export function toDateTimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * A deadline given in a link (`?deadline=`): Unix seconds, or anything `Date` can read.
 * Null when it's missing, unreadable or not in the future.
 */
export function parseDeadlineParam(value: string | null, now = new Date()): Date | null {
  if (!value) return null;
  const date = /^\d{9,11}$/.test(value) ? new Date(Number(value) * 1000) : new Date(value);
  return getDeadlineProblem(date, now) ? null : date;
}
