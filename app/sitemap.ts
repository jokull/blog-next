import { db } from "@/drizzle.config";
import { env } from "@/env";
import { Post } from "@/schema";
import { isNotNull } from "drizzle-orm";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = env.VERCEL_PROJECT_PRODUCTION_URL
		? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
		: "https://blog-shud.vercel.app";

	const posts = await db.query.Post.findMany({
		where: isNotNull(Post.publicAt),
		columns: {
			slug: true,
			publishedAt: true,
			modifiedAt: true,
		},
	});

	const postUrls = posts.map((post) => ({
		url: `${baseUrl}/${post.slug}`,
		lastModified: post.modifiedAt ?? post.publishedAt,
		changeFrequency: "monthly" as const,
		priority: 0.8,
	}));

	return [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: "weekly" as const,
			priority: 1,
		},
		...postUrls,
	];
}
