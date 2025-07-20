import { desc, eq, isNotNull, sql } from "drizzle-orm";
import Link from "next/link";
import { Suspense } from "react";
import { groupBy, pipe } from "remeda";
import { HeroPostCard, Theater } from "@/components/hero-post-card";
import { db } from "@/drizzle.config";
import { extractFirstParagraph } from "@/lib/mdx-content-utils";
import { Comment, Post } from "@/schema";
import { Albums } from "./_components/albums";
import { RecentShows } from "./_components/shows";

export const metadata = {
	title: "Jökull Sólberg",
};

export default async function Page() {
	const posts = await db.query.Post.findMany({
		where: isNotNull(Post.publicAt),
		orderBy: [desc(Post.publishedAt)],
	});

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

	// Find the most recent post with a hero image for the hero card
	const heroPost = posts.find((post) => post.heroImage);
	const heroPostExcerpt = heroPost ? await extractFirstParagraph(heroPost.markdown) : "";

	// Filter out the hero post from the regular listing if it exists
	const remainingPosts = heroPost ? posts.filter((post) => post.slug !== heroPost.slug) : posts;

	// Group remaining posts by year using Remeda
	const postsByYear = pipe(
		remainingPosts,
		groupBy((post) => post.publishedAt.getFullYear().toString()),
	);

	const sortedYears = Object.keys(postsByYear).sort((a, b) => (b > a ? 1 : -1));
	const currentYear = new Date().getFullYear().toString();

	return (
		<div className="max-w-xl">
			{heroPost && (
				<HeroPostCard
					slug={heroPost.slug}
					title={heroPost.title}
					publishedAt={heroPost.publishedAt}
					heroImage={heroPost.heroImage!}
					excerpt={heroPostExcerpt}
					locale={heroPost.locale}
					commentCount={commentCountsMap[heroPost.slug] || 0}
				/>
			)}
			{sortedYears.map((year, index) => (
				<div key={year}>
					<div className="mb-7">
						{year !== currentYear && <h2 className="font-bold">{year}</h2>}
						<ul>
							{postsByYear[year]?.map((item) => (
								<li key={item.slug} className="font-medium">
									<Link
										href={`/${item.slug}`}
										className="group flex items-end justify-between gap-1"
										draggable={false}
									>
										<span className="block group-hover:text-neutral-950">
											{item.title}
											{commentCountsMap[item.slug] > 0 && (
												<span className="ml-2 inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 font-normal text-neutral-600 text-xs">
													{commentCountsMap[item.slug]} comment
													{commentCountsMap[item.slug] !== 1 ? "s" : ""}
												</span>
											)}
										</span>
										<span className="dot-leaders mb-[0.1rem] flex-1 font-normal text-neutral-200 text-sm leading-none transition-colors group-hover:text-neutral-500 group-hover:transition-none" />
										<time className="block self-start whitespace-nowrap font-normal text-neutral-400 tabular-nums tracking-tighter transition-colors group-hover:text-neutral-500 group-hover:transition-none">
											{item.publishedAt.toLocaleDateString(item.locale, {
												year: undefined,
												month: "short",
												day: "numeric",
											})}
										</time>
									</Link>
								</li>
							))}
						</ul>
					</div>
					{index === 0 && (
						<div className="mb-7">
							<Theater className="p-4">
								<Suspense>
									<Albums />
								</Suspense>
							</Theater>
						</div>
					)}
					{index === 1 && (
						<div className="mb-7">
							<Theater className="p-4">
								<Suspense>
									<RecentShows />
								</Suspense>
							</Theater>
						</div>
					)}
				</div>
			))}
		</div>
	);
}
