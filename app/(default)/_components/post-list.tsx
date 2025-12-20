"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMemo } from "react";
import { groupBy, pipe } from "remeda";

interface Category {
	slug: string;
	label: string;
}

interface Post {
	slug: string;
	title: string;
	publishedAt: Date;
	locale: "is" | "en";
	categorySlug: string | null;
}

interface PostListProps {
	posts: Post[];
	commentCounts: Record<string, number>;
	categories: Category[];
}

export function PostList({ posts, commentCounts, categories }: PostListProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const categorySlug = searchParams.get("category") ?? "all";

	const { sortedYears, postsByYear } = useMemo(() => {
		let filtered = posts;

		if (categorySlug !== "all") {
			filtered = posts.filter((p) => p.categorySlug === categorySlug);
		}

		const grouped = pipe(
			filtered,
			groupBy((post) => post.publishedAt.getFullYear().toString()),
		);

		return {
			postsByYear: grouped,
			sortedYears: Object.keys(grouped).sort((a, b) => (b > a ? 1 : -1)),
		};
	}, [posts, categorySlug]);

	const currentYear = new Date().getFullYear().toString();

	const handleCategoryChange = (value: string) => {
		const params = new URLSearchParams(searchParams.toString());
		if (value === "all") {
			params.delete("category");
		} else {
			params.set("category", value);
		}
		const newUrl = params.toString() ? `/?${params.toString()}` : "/";
		router.replace(newUrl, { scroll: false });
	};

	return (
		<>
			<div className="mb-7">
				<ToggleGroup
					selectionMode="single"
					selectedKeys={[categorySlug]}
					onSelectionChange={(keys) => {
						const selected = Array.from(keys)[0] as string;
						if (selected) {
							handleCategoryChange(selected);
						}
					}}
				>
					<ToggleGroupItem id="all">All</ToggleGroupItem>
					{categories.map((category) => (
						<ToggleGroupItem key={category.slug} id={category.slug}>
							{category.label}
						</ToggleGroupItem>
					))}
				</ToggleGroup>
			</div>

			{sortedYears.map((year) => (
				<div key={year} className="mb-7">
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
										{commentCounts[item.slug] > 0 && (
											<span className="ml-2 inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 font-normal text-neutral-600 text-xs">
												{commentCounts[item.slug]} comment
												{commentCounts[item.slug] !== 1 ? "s" : ""}
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
			))}
		</>
	);
}
