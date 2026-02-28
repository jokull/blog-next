import { z } from "zod";

const envSchema = z.object({
	DATABASE_URL: z.string().min(1),
	DATABASE_AUTH_TOKEN: z.string().default(""),
	GITHUB_CLIENT_ID: z.string().min(1),
	GITHUB_CLIENT_SECRET: z.string().min(1),
	NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
	SITE_URL: z.string().default("https://solberg.is"),
	ONEDOLLARSTATS_API_KEY: z.string().min(1),
});

export const env = envSchema.parse(process.env);
