import { createClient } from "@libsql/client";
import type { Config } from "drizzle-kit";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "./env";
import * as schema from "./schema";

const client = createClient({
	url: env.DATABASE_URL,
	authToken: env.DATABASE_AUTH_TOKEN ?? "",
});

export const db = drizzle(client, { schema });

export default {
	schema: "./schema.ts", // Path to your schema file
	out: "./migrations", // Directory where migrations will be generated
	dialect: "turso",
	dbCredentials: {
		url: env.DATABASE_URL,
	},
} satisfies Config;
