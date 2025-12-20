import { env } from "@/env";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	const baseUrl = env.VERCEL_PROJECT_PRODUCTION_URL
		? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
		: "https://blog-shud.vercel.app";

	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: ["/admin", "/api/", "/**/editor"],
			},
		],
		sitemap: `${baseUrl}/sitemap.xml`,
	};
}
