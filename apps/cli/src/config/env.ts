import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production"]).default("development"),
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("debug"),
    PORT: z.string().min(1).default("3000"),

    BETTER_AUTH_URL: z.string().min(1).default("http://localhost:3000"),
    BETTER_AUTH_SECRET: z.string().min(1).default("goodsecrethere"),

    GOOGLE_CLIENT_ID:z.string().min(1),
    GOOGLE_CLIENT_SECRET:z.string().min(1),

    REDIRECT_URI: z.string().min(1).default("http://localhost:3000/api/auth/callback/google"),
  },
  runtimeEnv: process.env,
});
