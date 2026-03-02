import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
// @ts-expect-error — virtual module provided by @cloudflare/vite-plugin at runtime
import { env } from "cloudflare:workers";
import * as schema from "./schema";

let _db: DrizzleD1Database<typeof schema> | undefined;

export function getDb() {
	// oxlint-disable-next-line typescript-eslint/no-unsafe-member-access
	_db ??= drizzle((env as Record<string, unknown>).DB as Parameters<typeof drizzle>[0], {
		schema,
	});
	return _db;
}

// Proxy so existing `import { db }` calls keep working
export const db = new Proxy({} as DrizzleD1Database<typeof schema>, {
	get(_, prop) {
		const real = getDb();
		const value = real[prop as keyof typeof real];
		if (typeof value === "function") {
			return value.bind(real);
		}
		return value;
	},
});
