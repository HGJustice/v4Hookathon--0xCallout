
import "dotenv/config"
import { z } from "zod"

const address = z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "must be a 0x-prefixed 40-character hex address");

const scheme = z
    .object({
        NEYNAR_API_KEY: z.string(),
        NEYNAR_WEBHOOK_SECRET: z.string(),
        BOT_FID: z.coerce.number().int().positive(),
        BOT_SGINER_UUID: z.string(),
        RPC_URL: z.string(),
        FACTORY_ADDRESS: address,
        CHAIN_ID: z.coerce.number().int(),
        APP_URL: z.string(),
        DATABASE_URL: z.string().startsWith("postgresql://"),
        PORT:z.coerce.number().int()
    })

const parsed = scheme.safeParse(process.env);

if (!parsed.success){
    console.error("Invalid env configuration!");
    for ( const issue of parsed.error.issues) {
        console.error(`${issue.path.join(".")}:${issue.message}`)
    }
    process.exit(1)
}

export const env = parsed.data