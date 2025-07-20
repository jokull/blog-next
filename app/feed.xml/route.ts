import RSS from "rss";
import { desc, isNotNull } from "drizzle-orm";
import { db } from "@/drizzle.config";
import { Post } from "@/schema";
import { extractFirstParagraph } from "@/lib/mdx-content-utils";

export async function GET() {
	const baseUrl = process.env.NODE_ENV === "production" 
		? "https://blog.jokull.dev" 
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
		
		feed.item({
			title: post.title,
			description: description || post.title,
			url: `${baseUrl}/${post.slug}`,
			guid: post.slug,
			date: post.publishedAt,
			author: "jokull@solberg.is (Jökull Sólberg)",
		});
	}

	return new Response(feed.xml({ indent: true }), {
		headers: {
			"Content-Type": "application/rss+xml; charset=utf-8",
		},
	});
}