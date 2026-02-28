import { createClient } from "@libsql/client/web";
import type { Config } from "drizzle-kit";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { env } from "./env";
import * as schema from "./schema";

let _db: LibSQLDatabase<typeof schema> | undefined;

export function getDb() {
	if (!_db) {
		const client = createClient({
			url: env.DATABASE_URL,
			authToken: env.DATABASE_AUTH_TOKEN,
		});
		_db = drizzle(client, { schema });
	}
	return _db;
}

// Proxy so existing `import { db }` calls keep working
export const db = new Proxy({} as LibSQLDatabase<typeof schema>, {
	get(_, prop) {
		const real = getDb();
		const value = real[prop as keyof typeof real];
		if (typeof value === "function") {
			return value.bind(real);
		}
		return value;
	},
});

export default {
	schema: "./schema.ts",
	out: "./migrations",
	dialect: "turso",
	dbCredentials: {
		url: env.DATABASE_URL,
	},
} satisfies Config;
