import { eq, isNotNull } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { cache } from "react";
import { db } from "../../../../drizzle.config";
import { Post } from "../../../../schema";

const getPost = cache(
	async (slug: string) =>
		await db.query.Post.findFirst({
			where: eq(Post.slug, slug),
		}),
);

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ slug: string }> },
) {
	const { slug } = await params;

	const post = await getPost(slug);

	// Return 404 if post doesn't exist or isn't published
	if (!post || !post.publicAt) {
		return new NextResponse("Not Found", { status: 404 });
	}

	// Format the date as YYYY-MM-DD
	const formattedDate = post.publicAt.toISOString().split("T")[0];

	// Create a proper markdown document with H1 title and date
	const markdownDocument = `# ${post.title}

${formattedDate}

${post.markdown}`;

	// Return markdown document with text/plain mimetype
	return new NextResponse(markdownDocument, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
		},
	});
}

export async function generateStaticParams() {
	const posts = await db.query.Post.findMany({
		where: isNotNull(Post.publicAt),
	});
	return posts.map((post) => ({
		slug: post.slug,
	}));
}
