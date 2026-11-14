// Fails if the fees in src/lib/protocol.ts differ from the constants in the
// MarketplaceFactory contract, so the site can't advertise (or later send) stale amounts.
// Runs as part of `npm run lint`.
import { existsSync, readFileSync } from "node:fs";

const CONTRACT = new URL("../../contracts/src/Marketplace/MarketplaceFactory.sol", import.meta.url);
const FRONTEND = new URL("../src/lib/protocol.ts", import.meta.url);

// FEES key in protocol.ts → constant name in the contract.
const PAIRS = { marketSetup: "MARKET_SETUP_FEE", protocol: "PROTOCOL_FEE", outcome: "PROPOSE_OUTCOME_FEE" };

if (!existsSync(CONTRACT)) {
  console.warn("check-fees: contracts/ not found next to frontend/, skipping.");
  process.exit(0);
}

const contract = readFileSync(CONTRACT, "utf8");
const frontend = readFileSync(FRONTEND, "utf8");

const mismatches = Object.entries(PAIRS).flatMap(([key, constant]) => {
  const inContract = contract.match(new RegExp(`\\b${constant}\\s*=\\s*([\\d.]+)\\s*ether\\s*;`))?.[1];
  const inFrontend = frontend.match(new RegExp(`\\b${key}:\\s*"([\\d.]+)"`))?.[1];
  if (!inContract || !inFrontend) return [`${constant} / FEES.${key}: not found (contract ${inContract}, frontend ${inFrontend})`];
  return Number(inContract) === Number(inFrontend) ? [] : [`${constant} is ${inContract} ETH but FEES.${key} is ${inFrontend}`];
});

if (mismatches.length) {
  console.error(`check-fees: src/lib/protocol.ts is out of date with the contract:\n  ${mismatches.join("\n  ")}`);
  process.exit(1);
}
console.log("check-fees: FEES match MarketplaceFactory.sol");
