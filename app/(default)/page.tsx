import { desc, isNotNull } from "drizzle-orm";
import Link from "next/link";
import { Suspense } from "react";
import { groupBy, pipe } from "remeda";
import { db } from "@/drizzle.config";
import { Post } from "@/schema";
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

	// Group posts by year using Remeda
	const postsByYear = pipe(
		posts,
		groupBy((post) => post.publishedAt.getFullYear().toString()),
	);

	const sortedYears = Object.keys(postsByYear).sort((a, b) => (b > a ? 1 : -1));

	return (
		<div className="max-w-xl">
			{sortedYears.map((year, index) => (
				<div key={year}>
					<div className="mb-7">
						<h2 className="font-light">{year}</h2>
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
							<h2 className="mb-2">Random Albums</h2>
							<Suspense>
								<Albums />
							</Suspense>
						</div>
					)}
					{index === 1 && (
						<div className="mb-7">
							<h2 className="mb-2">Recent Shows</h2>
							<Suspense>
								<RecentShows />
							</Suspense>
						</div>
					)}
				</div>
			))}
		</div>
	);
}
