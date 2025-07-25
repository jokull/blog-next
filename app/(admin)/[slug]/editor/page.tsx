import { compile, run } from "@mdx-js/mdx";
import { eq } from "drizzle-orm";
import type { ReactElement, ReactNode } from "react";
import * as runtime from "react/jsx-runtime";
import { requireAdmin } from "@/auth";
import { ClientErrorBoundary } from "@/components/error-boundary";
import { db } from "@/drizzle.config";
import { components } from "@/mdx-components";
import { Post } from "@/schema";
import { Editor } from "./_components/editor";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	await requireAdmin(`/${slug}/editor`);

	let post = await db.query.Post.findFirst({ where: eq(Post.slug, slug) });
	if (!post) {
		post = await db
			.insert(Post)
			.values({
				slug,
				title: "New Post",
				markdown: "# New Post",
				publicAt: new Date(),
				createdAt: new Date(),
				publishedAt: new Date(),
			})
			.returning()
			.get();
	}

	let mdx: ReactElement | null = null;
	let mdxError: ReactNode | null = null;
	try {
		const code = String(
			await compile(post.previewMarkdown || post.markdown, {
				outputFormat: "function-body",
			}),
		);
		mdx = (
			await run(code, {
				...runtime,
				baseUrl: import.meta.url,
			})
		).default({ components });
	} catch (error: unknown) {
		mdxError = <div>{String(error)}</div>;
	}

	return (
		<Editor
			post={post}
			mdx={mdxError ? mdxError : <ClientErrorBoundary>{mdx}</ClientErrorBoundary>}
		/>
	);
}
