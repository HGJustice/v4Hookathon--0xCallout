import { formatEther, parseEther } from "viem";

/** An amount for display: up to 4 decimals, and "<0.0001" rather than a misleading 0. */
export function formatAmount(value: number | string, symbol: string): string {
  const amount = Number(value);
  if (amount > 0 && amount < 0.0001) return `<0.0001 ${symbol}`;
  return `${amount.toLocaleString("en-US", { maximumFractionDigits: 4 })} ${symbol}`;
}

/** Wei as ETH for display, e.g. 12000000000000000n → "0.012 ETH". */
export const formatEth = (wei: bigint) => formatAmount(formatEther(wei), "ETH");

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const UNITS: [unit: Intl.RelativeTimeFormatUnit, seconds: number][] = [
  ["year", 365 * 86_400],
  ["month", 30 * 86_400],
  ["week", 7 * 86_400],
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
];

/** How far `targetMs` is from `nowMs`, in words: "in 3 days", "tomorrow", "2 hours ago". */
export function formatRelativeTime(targetMs: number, nowMs: number): string {
  const seconds = (targetMs - nowMs) / 1000;
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
  }
  return relative.format(Math.round(seconds), "second");
}

/** A share count for display (shares have 18 decimals like ETH): up to 4 decimals, "<0.0001" when tiny but not zero. */
export function formatShares(shares: bigint): string {
  const value = Number(formatEther(shares));
  if (value > 0 && value < 0.0001) return "<0.0001";
  return value.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

const dateTime = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" });

/** A moment as a date and time in the viewer's time zone, e.g. "Dec 31, 2026, 10:00 PM". */
export const formatDateTime = (ms: number) => dateTime.format(ms);

/** 0x1234…abcd */
export const shortAddress = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`;

/**
 * An amount of ETH typed by a user, in wei. Null for anything that isn't a plain decimal
 * number with at most 18 decimals (empty, "." or "1e3"), so callers can treat it as "not
 * entered yet".
 */
export function parseEthInput(value: string): bigint | null {
  if (!/^\d*\.?\d{0,18}$/.test(value) || !/\d/.test(value)) return null;
  return parseEther(value);
}
