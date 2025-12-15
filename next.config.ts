import type { NextConfig } from "next";

export default {
	experimental: {
		authInterrupts: true,
	},
	transpilePackages: ["shiki"],
	images: {
		contentDispositionType: "inline",
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
		qualities: [75, 80],
	},
	async rewrites() {
		return [
			{
				source: "/:slug.md",
				destination: "/api/markdown/:slug",
			},
		];
	},
} satisfies NextConfig;
