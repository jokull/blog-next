import { env } from "@/env";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	const baseUrl = env.SITE_URL;

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
