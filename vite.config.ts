import { resolve } from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import vinext from "vinext";
import { defineConfig } from "vite";

export default defineConfig({
	resolve: {
		// Cloudflare Workers compatibility aliases:
		// - @libsql/client → /web: drizzle-orm/libsql imports the bare path which
		//   bundles Node HTTP transport. The /web export uses fetch-based HTTP.
		// - cross-fetch → shim: @libsql/hrana-client imports cross-fetch which
		//   pulls in node-fetch. Workers have native fetch, so we shim it out.
		//   See lib/cross-fetch-shim.ts for details.
		alias: [
			{
				find: /^@libsql\/client$/,
				replacement: "@libsql/client/web",
			},
			{
				find: /^cross-fetch$/,
				replacement: resolve(import.meta.dirname, "lib/cross-fetch-shim.ts"),
			},
		],
	},
	plugins: [
		vinext(),
		tailwindcss(),
		cloudflare({
			viteEnvironment: {
				name: "rsc",
				childEnvironments: ["ssr"],
			},
		}),
	],
});
