import { desc, isNotNull } from "drizzle-orm";
import RSS from "rss";
import { db } from "@/drizzle.config";
import { env } from "@/env";
import { extractFirstParagraph } from "@/lib/mdx-content-utils";
import { extractFirstImage, normalizeImageUrl } from "@/lib/mdx-image-extractor";
import { Post } from "@/schema";

export async function GET() {
	const baseUrl = env.VERCEL_PROJECT_PRODUCTION_URL
		? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
		: `http://localhost:${process.env.PORT || 3000}`;

	const feed = new RSS({
		title: "Jökull Sólberg",
		description: "Personal blog about web development, technology, and occasional thoughts",
		generator: "RSS for Node and Next.js",
		feed_url: `${baseUrl}/feed.xml`,
		site_url: baseUrl,
		managingEditor: "jokull@solberg.is (Jökull Sólberg)",
		webMaster: "jokull@solberg.is (Jökull Sólberg)",
		copyright: `Copyright ${new Date().getFullYear()} Jökull Sólberg`,
		language: "en-US",
		pubDate: new Date().toUTCString(),
		ttl: 60,
	});

	// Get all published posts
	const posts = await db.query.Post.findMany({
		where: isNotNull(Post.publicAt),
		orderBy: [desc(Post.publishedAt)],
		limit: 20, // Limit to most recent 20 posts
	});

	// Add each post to the feed
	for (const post of posts) {
		// Extract first paragraph as description
		const description = await extractFirstParagraph(post.markdown);

		// Get hero image from database or extract from markdown
		let heroImageUrl: string | null = post.heroImage;
		if (!heroImageUrl) {
			const extractedImage = await extractFirstImage(post.markdown);
			heroImageUrl = extractedImage ? normalizeImageUrl(extractedImage, baseUrl) : null;
		} else {
			heroImageUrl = normalizeImageUrl(heroImageUrl, baseUrl);
		}

		const feedItem: any = {
			title: post.title,
			description: description || post.title,
			url: `${baseUrl}/${post.slug}`,
			guid: post.slug,
			date: post.publishedAt,
			author: "jokull@solberg.is (Jökull Sólberg)",
		};

		// Add hero image as enclosure if available
		if (heroImageUrl) {
			feedItem.enclosure = {
				url: heroImageUrl,
				type: getMimeType(heroImageUrl),
			};
		}

		feed.item(feedItem);
	}

	return new Response(feed.xml({ indent: true }), {
		headers: {
			"Content-Type": "application/rss+xml; charset=utf-8",
		},
	});
}

function getMimeType(url: string): string {
	const extension = url.split(".").pop()?.toLowerCase();

	switch (extension) {
		case "jpg":
		case "jpeg":
			return "image/jpeg";
		case "png":
			return "image/png";
		case "gif":
			return "image/gif";
		case "webp":
			return "image/webp";
		case "svg":
			return "image/svg+xml";
		case "avif":
			return "image/avif";
		default:
			return "image/jpeg"; // Fallback to JPEG
	}
}
