import { desc, isNull } from "drizzle-orm";
import Link from "next/link";
import { groupBy, pipe } from "remeda";
import { requireAuth } from "@/auth";
import { db } from "@/drizzle.config";
import { Post } from "@/schema";

export const metadata = {
	title: "Jökull Sólberg",
};

export default async function Page() {
	await requireAuth();

	const posts = await db.query.Post.findMany({
		where: isNull(Post.publicAt),
		orderBy: [desc(Post.publishedAt)],
	});

	// Group posts by year using Remeda
	const postsByYear = pipe(
		posts,
		groupBy((post) => post.publishedAt.getFullYear().toString()),
	);

	return (
		<div>
			{Object.keys(postsByYear)
				.sort((a, b) => (b > a ? 1 : -1))
				.map((year) => (
					<div key={year} className="mb-7">
						<h2 className="font-light">{year}</h2>
						<ul>
							{postsByYear[year]?.map((item) => (
								<li key={item.slug} className="font-medium">
									<Link
										href={`/${item.slug}`}
										className="group flex items-end justify-between gap-1"
										draggable={false}
									>
										<span className="block text-blue-500 group-hover:text-blue-700">
											{item.title}
										</span>
										<span className="dot-leaders mb-[0.1rem] flex-1 font-normal text-blue-100 text-sm leading-none transition-colors group-hover:text-blue-500 group-hover:transition-none" />
										<time className="block self-start whitespace-nowrap font-normal text-blue-200 tabular-nums tracking-tighter transition-colors group-hover:text-blue-500 group-hover:transition-none">
											{item.publishedAt.toLocaleDateString(item.locale, {
												year: undefined,
												month: "long",
												day: "numeric",
											})}
										</time>
									</Link>
								</li>
							))}
						</ul>
					</div>
				))}
		</div>
	);
}
