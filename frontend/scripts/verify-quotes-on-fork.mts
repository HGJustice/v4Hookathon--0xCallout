// Checks the bet quotes and redeem amounts the market pages show against the REAL contract,
// on a local fork of Arbitrum Sepolia. Shares must match to within a wei or two, the price
// after a bet exactly, and payouts to within a few wei. Run it whenever the contract's
// betMarket / redeemMarket or the pool changes (for example when CalloutHook adds a fee).
//
//   anvil --fork-url https://sepolia-rollup.arbitrum.io/rpc --port 8546 &
//   (cd ../contracts && forge create src/Marketplace/MarketplaceFactory.sol:MarketplaceFactory \
//      --rpc-url http://127.0.0.1:8546 --private-key <anvil key #0> --broadcast \
//      --constructor-args <PoolManager> <multisig> <cre>)
//   FACTORY=0x<deployed address> npx tsx --tsconfig tsconfig.json scripts/verify-quotes-on-fork.mts
//
// Uses anvil's well-known dev accounts; never run it against a real network.
/* eslint-disable */
import assert from "node:assert/strict";
import { createPublicClient, createWalletClient, http as viemHttp, parseEther, type Address } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { createConfig, http, mock } from "wagmi";
import { connect } from "wagmi/actions";

const FE = new URL("../src/lib", import.meta.url).pathname;
const RPC = "http://127.0.0.1:8546";
if (!process.env.FACTORY) throw new Error("Set FACTORY to the MarketplaceFactory address deployed on the fork.");
process.env.NEXT_PUBLIC_MARKETPLACE_FACTORY_ADDRESS = process.env.FACTORY;
const { fetchMarket, fetchPoolState, fetchPosition } = await import(`${FE}/markets/reads.ts`);
const { quoteBet, getRedeemAmount, Outcome } = await import(`${FE}/markets/market.ts`);
const writes = await import(`${FE}/markets/writes.ts`);
const { marketplaceFactory } = await import(`${FE}/contracts/marketplaceFactory.ts`);

const chain = { ...arbitrumSepolia, rpcUrls: { default: { http: [RPC] } } } as const;
const ALICE: Address = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", BOB: Address = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", CAROL: Address = "0x90F79bf6EB2c4f870365E785982E1f101E93b906";
const MULTISIG: Address = "0x2eF691B20E7c79D02c5Ac5ba0D5cC6DC73aB3b79";
const pub = createPublicClient({ chain, transport: viemHttp(RPC, { timeout: 120_000 }) });
async function wallet(account: Address) {
  const c = createConfig({ chains: [chain], connectors: [mock({ accounts: [account] })], transports: { [chain.id]: http(RPC) } });
  await connect(c, { connector: c.connectors[0] });
  return c;
}
const [alice, bob, carol] = await Promise.all([wallet(ALICE), wallet(BOB), wallet(CAROL)]);
const near = (a: bigint, b: bigint, label: string, tolWei = 50n) => { const d = a > b ? a - b : b - a; assert.ok(d <= tolWei, `${label}: predicted ${a}, actual ${b}, off by ${d}`); return d; };
let checks = 0; const ok = (m: string) => { checks++; console.log("  ✓", m); };

const deadline = new Date(Date.now() + 7 * 86_400_000);
const { marketId } = await writes.createMarket(alice, { question: "Quote check: will it rain?", deadline, amount: parseEther("0.02") });
const id = marketId as bigint;

async function betAndCompare(who: Address, cfg: any, side: 1 | 2, eth: string) {
  const market = (await fetchMarket(cfg, id))!;
  const state = await fetchPoolState(cfg, market);
  const amount = parseEther(eth);
  const q = quoteBet({ side, amount, reserves: state.reserves, supplies: state.supplies, balance: market.balance });
  const before = await fetchPosition(cfg, market, who);
  await writes.placeBet(cfg, { marketId: id, side, amount });
  const after = await fetchPosition(cfg, market, who);
  const got = side === Outcome.Yes ? after.yes - before.yes : after.no - before.no;
  const off = near(q.shares, got, `${who.slice(0, 6)} ${side === 1 ? "YES" : "NO"} shares`);
  const marketAfter = (await fetchMarket(cfg, id))!;
  assert.ok(Math.abs(marketAfter.yesProbability! - q.yesProbability!) < 0.0002, `probability ${q.yesProbability} vs ${marketAfter.yesProbability}`);
  ok(`${eth} ETH on ${side === 1 ? "YES" : "NO"}: predicted ${q.shares} shares, got ${got} (off by ${off} wei); odds ${(q.yesProbability! * 100).toFixed(2)}% vs ${(marketAfter.yesProbability! * 100).toFixed(2)}%`);
  return q;
}

console.log("quotes vs real bets");
const qBob1 = await betAndCompare(BOB, bob, 1, "0.003");
const qCarol = await betAndCompare(CAROL, carol, 2, "0.005");
await betAndCompare(BOB, bob, 1, "0.002");
await betAndCompare(CAROL, carol, 2, "0.0001");

console.log("payout vs real redeem");
// Quote Bob's final payout from the market as it stands, then resolve YES and redeem.
const market = (await fetchMarket(bob, id))!;
const bobPos = await fetchPosition(bob, market, BOB);
await pub.request({ method: "anvil_impersonateAccount" as never, params: [MULTISIG] as never });
await pub.request({ method: "anvil_setBalance" as never, params: [MULTISIG, "0xDE0B6B3A7640000"] as never });
const ms = createWalletClient({ chain, transport: viemHttp(RPC, { timeout: 120_000 }), account: MULTISIG });
await pub.waitForTransactionReceipt({ hash: await ms.writeContract({ address: marketplaceFactory!.address, abi: marketplaceFactory!.abi, functionName: "finaliseDisputedMarket", args: [id, Outcome.Yes] }) });
const resolved = (await fetchMarket(bob, id))!;
const predicted = getRedeemAmount(resolved, bobPos);
const balBefore = await pub.getBalance({ address: BOB });
const rc = await writes.redeem(bob, { marketId: id });
const paid = (await pub.getBalance({ address: BOB })) - balBefore + rc.gasUsed * rc.effectiveGasPrice;
near(predicted, paid, "redeem amount", 1000n);
ok(`getRedeemAmount predicted ${predicted} wei, redeem paid ${paid} wei`);
assert.ok(qBob1.payoutIfWins > 0n);

console.log("payoutIfWins on an untouched market (a single bet, nobody after)");
for (const [side, eth] of [[1, "0.004"], [2, "0.006"]] as const) {
  const m = await writes.createMarket(alice, { question: `Single bet ${side}: will it snow?`, deadline, amount: parseEther("0.02") });
  const mk = (await fetchMarket(bob, m.marketId))!;
  const st = await fetchPoolState(bob, mk);
  const q = quoteBet({ side, amount: parseEther(eth), reserves: st.reserves, supplies: st.supplies, balance: mk.balance });
  await writes.placeBet(bob, { marketId: m.marketId, side, amount: parseEther(eth) });
  await pub.waitForTransactionReceipt({ hash: await ms.writeContract({ address: marketplaceFactory!.address, abi: marketplaceFactory!.abi, functionName: "finaliseDisputedMarket", args: [m.marketId, side] }) });
  const before = await pub.getBalance({ address: BOB });
  const r = await writes.redeem(bob, { marketId: m.marketId });
  const got = (await pub.getBalance({ address: BOB })) - before + r.gasUsed * r.effectiveGasPrice;
  const d = q.payoutIfWins > got ? q.payoutIfWins - got : got - q.payoutIfWins;
  assert.ok(d * 1_000_000n < got, `payoutIfWins ${q.payoutIfWins} vs actual ${got}`);
  ok(`${eth} ETH on ${side === 1 ? "YES" : "NO"}: predicted payout ${q.payoutIfWins}, actual ${got} (off by ${d} wei)`);
}
console.log(`\n${checks} checks passed`);
process.exit(0);
