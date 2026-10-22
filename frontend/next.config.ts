import type { NextConfig } from "next";
import path from "node:path";

// wagmi bundles the Base Account SDK (loaded only if its connector is used, which we
// don't offer), which imports Coinbase's CDP SDK, which imports the optional x402
// payment packages. They're never executed here, so point them at an empty module
// instead of installing them.
const OPTIONAL_X402_IMPORTS = [
  "@x402/core/client",
  "@x402/evm",
  "@x402/evm/exact/client",
  "@x402/evm/upto/client",
  "@x402/svm/exact/client",
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Turbopack's on-disk caches have restored stale compiled CSS here (an old
  // gradient kept being served after globals.css changed). Compile fresh each run.
  experimental: {
    turbopackFileSystemCacheForDev: false,
    turbopackFileSystemCacheForBuild: false,
  },
  partialPrefetching: true,
  turbopack: {
    root: path.join(__dirname),
    resolveAlias: Object.fromEntries(
      OPTIONAL_X402_IMPORTS.map((name) => [name, "./src/lib/empty-module.cjs"]),
    ),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
