import {
  encodeAbiParameters,
  erc20Abi,
  isAddressEqual,
  keccak256,
  parseAbi,
  parseAbiParameters,
  toHex,
  type Address,
  type Hex,
} from "viem";
import type { Config } from "wagmi";
import { readContracts } from "wagmi/actions";
import { appChain } from "@/lib/chain";
import { requireMarketplaceFactory } from "@/lib/contracts/marketplaceFactory";
import { getPoolReserves, getYesProbability, type Market, type MarketData, type TokenAmounts } from "./market";

// Reads go through the app chain's RPC (every call carries its chainId), so they work
// without a connected wallet and whatever network the wallet is on.

/** Newest markets first, at most `limit` of them. */
export async function fetchMarkets(config: Config, { limit }: { limit: number }): Promise<Market[]> {
  const factory = requireMarketplaceFactory();
  const [nextId, poolManager] = await readContracts(config, {
    allowFailure: false,
    contracts: [
      { ...factory, functionName: "marketplaceID" },
      { ...factory, functionName: "poolManager" },
    ],
  });

  // Ids start at 1 and marketplaceID is the next one to be assigned.
  const newest = nextId - 1n;
  const count = Math.min(limit, Number(newest));
  if (count <= 0) return [];
  const ids = Array.from({ length: count }, (_, i) => newest - BigInt(i));

  const markets = await readContracts(config, {
    allowFailure: false,
    contracts: ids.map((id) => ({ ...factory, functionName: "getMarket", args: [id] }) as const),
  });
  return withOdds(config, poolManager, markets);
}

/** One market, or null if no market has this id. */
export async function fetchMarket(config: Config, id: bigint): Promise<Market | null> {
  const factory = requireMarketplaceFactory();
  const [market, poolManager] = await readContracts(config, {
    allowFailure: false,
    contracts: [
      { ...factory, functionName: "getMarket", args: [id] },
      { ...factory, functionName: "poolManager" },
    ],
  });
  // getMarket doesn't revert for unknown ids; it returns an empty struct (id 0).
  if (market.marketplaceID === 0n) return null;
  const [withPrice] = await withOdds(config, poolManager, [market]);
  return withPrice;
}

/** How many YES and NO shares an account holds in a market. */
export async function fetchPosition(
  config: Config,
  market: Pick<MarketData, "yesToken" | "noToken">,
  account: Address,
): Promise<{ yes: bigint; no: bigint }> {
  requireMarketplaceFactory();
  const [yes, no] = await readContracts(config, {
    allowFailure: false,
    contracts: [balanceOf(market.yesToken, account), balanceOf(market.noToken, account)],
  });
  return { yes, no };
}

const balanceOf = (token: Address, holder: Address) =>
  ({ address: token, abi: erc20Abi, functionName: "balanceOf", args: [holder], chainId: appChain.id }) as const;

// Uniswap v4 keeps every pool in one PoolManager; its state is read with extsload.
const extsloadAbi = parseAbi(["function extsload(bytes32 slot) view returns (bytes32)"]);
/** StateLibrary.POOLS_SLOT in v4-core: the storage slot of PoolManager's pools mapping. */
const POOLS_SLOT = 6n;
/** slot0 packs sqrtPriceX96 into its lowest 160 bits (then tick and fees). */
const SQRT_PRICE_MASK = (1n << 160n) - 1n;
/** A pool's liquidity sits this many slots after slot0, in the lowest 128 bits (StateLibrary.LIQUIDITY_OFFSET). */
const LIQUIDITY_OFFSET = 3n;
const LIQUIDITY_MASK = (1n << 128n) - 1n;

/** Where a pool's state starts in PoolManager storage: keccak256(abi.encode(poolId, POOLS_SLOT)), as StateLibrary does. Slot0 is first. */
function poolStateSlot(pool: MarketData["pool"]): Hex {
  const poolId = keccak256(
    encodeAbiParameters(parseAbiParameters("address, address, uint24, int24, address"), [
      pool.currency0,
      pool.currency1,
      pool.fee,
      pool.tickSpacing,
      pool.hooks,
    ]),
  );
  return keccak256(encodeAbiParameters(parseAbiParameters("bytes32, uint256"), [poolId, POOLS_SLOT]));
}

/**
 * Adds each market's YES probability from its pool's current price (slot0), the price a
 * bet actually trades at. Token balances would be simpler, but the PoolManager also holds
 * tokens outside the pool's curve (donations, ERC-6909 claims), which would skew them.
 */
async function withOdds(config: Config, poolManager: Address, markets: readonly MarketData[]): Promise<Market[]> {
  if (markets.length === 0) return [];
  const slots = await readContracts(config, {
    allowFailure: false,
    contracts: markets.map(
      (market) =>
        ({
          address: poolManager,
          abi: extsloadAbi,
          functionName: "extsload",
          args: [poolStateSlot(market.pool)],
          chainId: appChain.id,
        }) as const,
    ),
  });
  return markets.map((market, i) => ({
    ...market,
    poolManager,
    yesProbability: getYesProbability(
      BigInt(slots[i]) & SQRT_PRICE_MASK,
      isAddressEqual(market.yesToken, market.pool.currency0),
    ),
  }));
}

/** The numbers a bet quote needs: what the market's pool holds and how much of each token exists. */
export type PoolState = { reserves: TokenAmounts; supplies: TokenAmounts };

export async function fetchPoolState(
  config: Config,
  market: Pick<Market, "pool" | "yesToken" | "noToken" | "poolManager">,
): Promise<PoolState> {
  requireMarketplaceFactory();
  const { poolManager } = market;
  const slot = poolStateSlot(market.pool);
  const liquiditySlot = toHex(BigInt(slot) + LIQUIDITY_OFFSET, { size: 32 });
  const [slot0, liquidity, yesSupply, noSupply] = await readContracts(config, {
    allowFailure: false,
    contracts: [
      { address: poolManager, abi: extsloadAbi, functionName: "extsload", args: [slot], chainId: appChain.id },
      { address: poolManager, abi: extsloadAbi, functionName: "extsload", args: [liquiditySlot], chainId: appChain.id },
      { address: market.yesToken, abi: erc20Abi, functionName: "totalSupply", chainId: appChain.id },
      { address: market.noToken, abi: erc20Abi, functionName: "totalSupply", chainId: appChain.id },
    ],
  });
  return {
    reserves: getPoolReserves(
      BigInt(slot0) & SQRT_PRICE_MASK,
      BigInt(liquidity) & LIQUIDITY_MASK,
      isAddressEqual(market.yesToken, market.pool.currency0),
    ),
    supplies: { yes: yesSupply, no: noSupply },
  };
}
