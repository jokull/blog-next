import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().min(1),
		DATABASE_AUTH_TOKEN: z.string().default(""),
		GITHUB_CLIENT_ID: z.string().min(1),
		GITHUB_CLIENT_SECRET: z.string().min(1),
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default(() =>
				process.env.VERCEL_ENV === "production" ? "production" : "development",
			),
		VERCEL_ENV: z.enum(["development", "preview", "production"]).optional(),
		VERCEL_URL: z.string().optional(),
		VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
		ONEDOLLARSTATS_API_KEY: z.string().min(1),
	},
	experimental__runtimeEnv: {},
});
