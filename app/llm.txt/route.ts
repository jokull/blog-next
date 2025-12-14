import { desc, isNotNull } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { groupBy, pipe } from "remeda";
import { db } from "../../drizzle.config";
import { Post } from "../../schema";

export async function GET(_request: NextRequest) {
	const posts = await db.query.Post.findMany({
		where: isNotNull(Post.publicAt),
		orderBy: [desc(Post.publishedAt)],
	});

	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://blog-shud.vercel.app";

	// Group posts by year
	const postsByYear = pipe(
		posts,
		groupBy((post) => post.publishedAt.getFullYear().toString()),
	);

	const sortedYears = Object.keys(postsByYear).sort((a, b) => (b > a ? 1 : -1));

	// Build markdown content
	const lines: string[] = ["# Jökull Sólberg's Blog", ""];

	for (const year of sortedYears) {
		lines.push(`## ${year}`, "");
		for (const post of postsByYear[year] || []) {
			const date = post.publishedAt.toLocaleDateString(post.locale, {
				year: "numeric",
				month: "short",
				day: "numeric",
			});
			lines.push(`- [${post.title}](${baseUrl}/${post.slug}.md) - ${date}`);
		}
		lines.push("");
	}

	const markdown = lines.join("\n");

	return new NextResponse(markdown, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
		},
	});
}
