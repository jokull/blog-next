"use client";

import type { BrokenLink } from "@/lib/link-checker";
import Link from "next/link";

export function BrokenLinksReport({ brokenLinks }: { brokenLinks: BrokenLink[] }) {
	if (brokenLinks.length === 0) {
		return (
			<div className="rounded-lg border p-6">
				<h2 className="mb-2 font-semibold text-xl">Broken Links & Images</h2>
				<p className="text-green-600">All links and images are healthy.</p>
			</div>
		);
	}

	return (
		<div className="rounded-lg border p-6">
			<h2 className="mb-4 font-semibold text-xl">
				Broken Links & Images{" "}
				<span className="font-normal text-red-500 text-sm">
					({brokenLinks.length} issues)
				</span>
			</h2>
			<div className="space-y-3">
				{brokenLinks.map((link, i) => (
					<div
						key={`${link.postSlug}-${link.url}-${i}`}
						className="flex items-start gap-3 text-sm"
					>
						<span
							className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-xs ${
								link.type === "image"
									? "bg-amber-100 text-amber-700"
									: "bg-red-100 text-red-700"
							}`}
						>
							{link.type === "image" ? "IMG" : "LINK"}{" "}
							{link.status === "error" ? "ERR" : link.status}
						</span>
						<div className="min-w-0">
							<Link
								href={`/${link.postSlug}/editor`}
								className="font-medium text-blue-600 hover:underline"
							>
								{link.postTitle}
							</Link>
							<div className="truncate text-neutral-500">{link.url}</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
