"use client";

import { Table, TableHeader, TableBody, TableColumn } from "@/components/ui/table";
import type { InferSelectModel } from "drizzle-orm";
import type { Post } from "@/schema";
import { PostTableRow } from "./post-table-row";

interface PostsTableProps {
	posts: Array<InferSelectModel<typeof Post>>;
	categories: Array<{ slug: string; label: string }>;
}

export function PostsTable({ posts, categories }: PostsTableProps) {
	return (
		<div className="w-full overflow-x-auto">
			<Table aria-label="Blog posts">
				<TableHeader>
					<TableColumn isRowHeader>Title</TableColumn>
					<TableColumn>Published</TableColumn>
					<TableColumn>Language</TableColumn>
					<TableColumn>Category</TableColumn>
					<TableColumn>Published Date</TableColumn>
					<TableColumn>Modified Date</TableColumn>
				</TableHeader>
				<TableBody>
					{posts.map((post) => (
						<PostTableRow key={post.slug} post={post} categories={categories} />
					))}
				</TableBody>
			</Table>
		</div>
	);
}
