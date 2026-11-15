import { defineConfig } from "@wagmi/cli";
import { foundry } from "@wagmi/cli/plugins";

// Generates typed ABIs from the Foundry project in ../contracts. Run `npm run generate`
// after changing a contract and commit the output, so the app builds without Foundry.
//
// MarketplaceFactory is used rather than IMarketplaceFactory: the interface has no custom
// errors, and without them a revert (e.g. InsufficientSetupFee) can't be decoded.
export default defineConfig({
  out: "src/lib/contracts/generated.ts",
  plugins: [
    foundry({
      project: "../contracts",
      include: ["MarketplaceFactory.sol/MarketplaceFactory.json"],
    }),
  ],
});
