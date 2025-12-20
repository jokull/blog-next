import { Theater } from "@/components/theater";
import { db } from "@/drizzle.config";
import { Comment, Post } from "@/schema";
import { desc, eq, isNotNull, sql } from "drizzle-orm";
import { Suspense } from "react";
import { Albums } from "./_components/albums";
import { PostList } from "./_components/post-list";
import { RecentShows } from "./_components/shows";

export const metadata = {
	title: "Jökull Sólberg",
};

export default async function Page() {
	// Fetch all posts with category information
	const posts = await db.query.Post.findMany({
		where: isNotNull(Post.publicAt),
		orderBy: [desc(Post.publishedAt)],
	});

	// Fetch all categories
	const categories = await db.query.Category.findMany();

	// Get comment counts for all posts
	const commentCounts = await db
		.select({
			postSlug: Comment.postSlug,
			count: sql<number>`count(*)`.as("count"),
		})
		.from(Comment)
		.where(eq(Comment.isHidden, false))
		.groupBy(Comment.postSlug);

	const commentCountsMap = commentCounts.reduce(
		(acc, item) => {
			acc[item.postSlug] = item.count;
			return acc;
		},
		{} as Record<string, number>,
	);

	return (
		<div className="max-w-xl">
			<Suspense fallback={<div>Loading posts...</div>}>
				<PostList posts={posts} commentCounts={commentCountsMap} categories={categories} />
			</Suspense>

			<div className="mb-7">
				<Theater>
					<Suspense>
						<Albums />
					</Suspense>
				</Theater>
			</div>

			<div className="mb-7">
				<Theater>
					<Suspense>
						<RecentShows />
					</Suspense>
				</Theater>
			</div>
		</div>
	);
}
