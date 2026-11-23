import { parseAbiItem } from "viem";

// Mirrors MarketCreated in IMarketplaceFactory.sol.
export const marketCreatedEvent = parseAbiItem(
  "event MarketCreated(uint256 marketplaceID, string title, address initializer, uint256 balance, uint256 deadline, (address,address,uint24,int24,address) pool, address yesToken, address noToken)",
);