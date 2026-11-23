import { createPublicClient, http, type PublicClient } from "viem";
import { env } from "../lib/env.js";

export const publicClient: PublicClient = createPublicClient({
  transport: http(env.RPC_URL),
});