import type { NextConfig } from "next";

export default {
	experimental: {
		authInterrupts: true,
	},
	transpilePackages: ["shiki"],
	images: {
		contentDispositionType: "inline",
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
} satisfies NextConfig;
