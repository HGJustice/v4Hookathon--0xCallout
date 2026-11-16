// Unit tests for the money math the market pages show users. Run with `npm test`.
// Node runs the TypeScript sources directly; these modules only import types and viem.
import assert from "node:assert/strict";
import { test } from "node:test";
import { parseEthInput } from "../src/lib/format.ts";
import {
  getMarketStatus,
  getOutcomeLabel,
  getPoolReserves,
  getRedeemAmount,
  getYesProbability,
  Outcome,
  quoteBet,
} from "../src/lib/markets/market.ts";

const ETH = 10n ** 18n;
const Q96 = 1n << 96n;

// A market created with 0.02 ETH: 0.001 goes to the protocol, 0.019 seeds a pool that opens at 50/50.
const SEED = 19n * 10n ** 15n;
const fresh = { reserves: { yes: SEED, no: SEED }, supplies: { yes: SEED, no: SEED }, balance: SEED };

test("getPoolReserves: a pool at price 1 holds equal amounts, whichever token is YES", () => {
  assert.deepEqual(getPoolReserves(Q96, SEED, true), { yes: SEED, no: SEED });
  assert.deepEqual(getPoolReserves(Q96, SEED, false), { yes: SEED, no: SEED });
});

test("getPoolReserves: a higher price means less token0 and more token1", () => {
  const sqrtPrice = 2n * Q96; // price 4
  assert.deepEqual(getPoolReserves(sqrtPrice, SEED, true), { yes: SEED / 2n, no: SEED * 2n });
  assert.deepEqual(getPoolReserves(sqrtPrice, SEED, false), { yes: SEED * 2n, no: SEED / 2n });
});

test("getYesProbability: 50% at price 1, and null with no price", () => {
  assert.equal(getYesProbability(Q96, true), 0.5);
  assert.equal(getYesProbability(Q96, false), 0.5);
  assert.equal(getYesProbability(0n, true), null);
});

// These expected values were checked against the real contract on a fork (shares to the wei).
test("quoteBet: 0.003 ETH on YES in a fresh market", () => {
  const quote = quoteBet({ side: Outcome.Yes, amount: 3n * 10n ** 15n, ...fresh });
  assert.equal(quote.shares, 5590909090909090n);
  assert.equal(quote.yesProbability, 0.5727);
  // The only holder of the winning token takes the whole pot.
  assert.equal(quote.payoutIfWins, 22n * 10n ** 15n);
});

test("quoteBet: NO is the mirror image of YES", () => {
  const yes = quoteBet({ side: Outcome.Yes, amount: 3n * 10n ** 15n, ...fresh });
  const no = quoteBet({ side: Outcome.No, amount: 3n * 10n ** 15n, ...fresh });
  assert.equal(no.shares, yes.shares);
  assert.equal(no.payoutIfWins, yes.payoutIfWins);
  // Probabilities are floored to a basis point, so the mirror is exact to within one.
  assert.ok(Math.abs(no.yesProbability - (1 - yes.yesProbability)) <= 0.0001);
  assert.equal(no.yesProbability, 0.4272);
});

test("quoteBet: a bigger bet moves the price more and gets a worse average price", () => {
  const small = quoteBet({ side: Outcome.Yes, amount: 10n ** 15n, ...fresh });
  const big = quoteBet({ side: Outcome.Yes, amount: 10n ** 16n, ...fresh });
  assert.ok(big.yesProbability > small.yesProbability); // buying YES makes YES dearer
  assert.ok(big.shares * 10n < small.shares * 100n); // fewer than 10x the shares for 10x the ETH
});

test("quoteBet: existing holders of the winning token dilute the payout", () => {
  const alone = quoteBet({ side: Outcome.Yes, amount: 3n * 10n ** 15n, ...fresh });
  // Someone already holds 0.005 YES outside the pool: supply is higher, pool holds the same.
  const crowded = quoteBet({
    side: Outcome.Yes,
    amount: 3n * 10n ** 15n,
    ...fresh,
    supplies: { yes: SEED + 5n * 10n ** 15n, no: SEED + 5n * 10n ** 15n },
    balance: SEED + 5n * 10n ** 15n,
  });
  assert.ok(crowded.payoutIfWins < alone.payoutIfWins + 5n * 10n ** 15n);
  assert.ok(crowded.payoutIfWins > 0n);
});

test("getRedeemAmount: the market's ETH split by share of the winning token outside the pool", () => {
  const market = (finalOutcome) => ({ finalOutcome, balance: 100n, winningSupplyAtResolve: 50n, poolWinningBalanceAtResolve: 10n });
  assert.equal(getRedeemAmount(market(Outcome.Yes), { yes: 8n, no: 3n }), 20n); // 100 * 8 / 40
  assert.equal(getRedeemAmount(market(Outcome.No), { yes: 8n, no: 3n }), 7n); // 100 * 3 / 40, rounded down
  assert.equal(getRedeemAmount(market(Outcome.Void), { yes: 8n, no: 3n }), 0n);
  assert.equal(
    getRedeemAmount({ finalOutcome: Outcome.Yes, balance: 100n, winningSupplyAtResolve: 10n, poolWinningBalanceAtResolve: 10n }, { yes: 5n, no: 0n }),
    0n,
  ); // nothing outside the pool: no division by zero
});

test("getMarketStatus: each stage of a market's life", () => {
  const base = { resolved: false, outcomeDisputed: false, proposedOutcome: Outcome.Unresolved, deadline: 1000n };
  assert.equal(getMarketStatus(base, 999n), "open");
  assert.equal(getMarketStatus(base, 1000n), "closed");
  assert.equal(getMarketStatus({ ...base, proposedOutcome: Outcome.Yes }, 1500n), "proposed");
  assert.equal(getMarketStatus({ ...base, proposedOutcome: Outcome.Yes, outcomeDisputed: true }, 1500n), "disputed");
  assert.equal(getMarketStatus({ ...base, resolved: true }, 500n), "resolved"); // resolved early, never proposed
});

test("getOutcomeLabel: Unresolved is never called Void", () => {
  assert.equal(getOutcomeLabel(Outcome.Yes), "YES");
  assert.equal(getOutcomeLabel(Outcome.No), "NO");
  assert.equal(getOutcomeLabel(Outcome.Void), "Void");
  assert.equal(getOutcomeLabel(Outcome.Unresolved), "");
});

test("parseEthInput: plain decimals only, up to 18 places", () => {
  assert.equal(parseEthInput("0.01"), ETH / 100n);
  assert.equal(parseEthInput("1"), ETH);
  assert.equal(parseEthInput("1."), ETH);
  assert.equal(parseEthInput(".5"), ETH / 2n);
  assert.equal(parseEthInput("0"), 0n);
  assert.equal(parseEthInput("0.000000000000000001"), 1n);
  for (const bad of ["", ".", "1e3", "-1", "abc", "1,5", " 1", "0.0000000000000000001"]) {
    assert.equal(parseEthInput(bad), null, `"${bad}" should be rejected`);
  }
});
