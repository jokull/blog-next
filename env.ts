import { z } from "zod";

const envSchema = z.object({
	GITHUB_CLIENT_ID: z.string().min(1),
	GITHUB_CLIENT_SECRET: z.string().min(1),
	NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
	SITE_URL: z.string().default("https://solberg.is"),
	ONEDOLLARSTATS_API_KEY: z.string().min(1),
});

type Env = z.infer<typeof envSchema>;

let _env: Env | undefined;

export const env = new Proxy({} as Env, {
	get(_, prop: string) {
		if (!_env) {
			const result = envSchema.safeParse(process.env);
			if (result.success) {
				_env = result.data;
			} else {
				// During Workers startup, process.env isn't populated yet.
				// Return the raw value if available, otherwise undefined.
				return process.env[prop];
			}
		}
		return _env[prop as keyof Env];
	},
});
