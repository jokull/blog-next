import { requireAdmin } from "@/auth";
import { db } from "@/db";
import { env } from "@/env";
import { checkPostLinks } from "@/lib/link-checker";
import { createStatsClient } from "@/lib/onedollarstats";
import { Category, Post } from "@/schema";
import { asc, desc, sql } from "drizzle-orm";
import { Suspense } from "react";
import { BrokenLinksReport } from "./_components/broken-links-report";
import { CategoryManager } from "./_components/category-manager";
import { PostsTable } from "./_components/posts-table";
import { VisitsChartClient } from "./_components/visits-chart-client";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
	await requireAdmin("/admin");

	// Fetch all posts (drafts + published)
	const posts = await db.query.Post.findMany({
		orderBy: [desc(Post.publishedAt)],
	});

	// Fetch all categories
	const categories = await db.query.Category.findMany({
		orderBy: [asc(Category.label)],
	});

	// Calculate post counts per category
	const postCountsResult = await db
		.select({
			categorySlug: Post.categorySlug,
			count: sql<number>`count(*)`,
		})
		.from(Post)
		.groupBy(Post.categorySlug);

	const postCounts = new Map(postCountsResult.map((c) => [c.categorySlug, Number(c.count)]));

	// Fetch visitor stats + per-page pageviews
	const statsClient = createStatsClient();
	const [dailyResult, weeklyResult, pageviewsResult] = await Promise.all([
		statsClient.getDailyVisits("30d"),
		statsClient.getWeeklyVisits("6mo"),
		statsClient.getPageviews("7d"),
	]);

	// Build slug -> pageviews record (paths like "/my-post" -> pageviews)
	const pageviewsBySlug: Record<string, number> = {};
	if (pageviewsResult.isOk()) {
		for (const [path, views] of pageviewsResult.value) {
			const slug = path.replace(/^\//, "");
			if (slug) pageviewsBySlug[slug] = views;
		}
	}

	const shortTermData = dailyResult.match({
		ok: (data) =>
			data.map((day) => ({
				date: new Date(day.date).toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
				}),
				Visitors: day.visitors,
				Visits: day.visits,
				Pageviews: day.pageviews,
			})),
		err: () => null,
	});

	const longTermData = weeklyResult.match({
		ok: (data) =>
			data.map((week) => ({
				date: new Date(week.date).toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
				}),
				Visitors: week.visitors,
				Visits: week.visits,
				Pageviews: week.pageviews,
			})),
		err: () => null,
	});

	return (
		<div className="container mx-auto max-w-7xl px-4 py-8">
			<h1 className="mb-8 font-bold text-3xl">Admin Dashboard</h1>

			<CategoryManager categories={categories} postCounts={postCounts} />

			<PostsTable posts={posts} categories={categories} pageviewsBySlug={pageviewsBySlug} />

			<div className="mt-8">
				{shortTermData && longTermData ? (
					<VisitsChartClient shortTermData={shortTermData} longTermData={longTermData} />
				) : (
					<div className="rounded-lg border p-6">
						<h2 className="mb-4 font-semibold text-xl">Visits</h2>
						<div className="text-red-600">Failed to load stats</div>
					</div>
				)}
			</div>

			<div className="mt-8">
				<Suspense
					fallback={
						<div className="rounded-lg border p-6">
							<h2 className="mb-4 font-semibold text-xl">Broken Links & Images</h2>
							<div className="animate-pulse text-neutral-400">Checking links...</div>
						</div>
					}
				>
					<BrokenLinksChecker posts={posts} />
				</Suspense>
			</div>
		</div>
	);
}

async function BrokenLinksChecker({
	posts,
}: {
	posts: Array<{ slug: string; title: string; markdown: string }>;
}) {
	const brokenLinks = await checkPostLinks(posts, env.SITE_URL);
	return <BrokenLinksReport brokenLinks={brokenLinks} />;
}
