// Fees charged by the MarketplaceFactory contract, in ETH. These mirror the constants in
// contracts/src/Marketplace/MarketplaceFactory.sol; change both together.
export const FEES = {
  /** MARKET_SETUP_FEE: the minimum to create a market. */
  marketSetup: "0.005",
  /** PROTOCOL_FEE: taken out of the setup amount; the rest seeds the pool. */
  protocol: "0.001",
  /** PROPOSE_OUTCOME_FEE: to propose an outcome, and to dispute one. */
  outcome: "0.005",
} as const;
