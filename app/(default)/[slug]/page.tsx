import { getGithubUser, getSession, isAdmin } from "@/auth";
import { CommentsSection } from "@/components/comments-section";
import { ClientErrorBoundary } from "@/components/error-boundary";
import { db } from "@/drizzle.config";
import { env } from "@/env";
import { extractFirstParagraph } from "@/lib/mdx-content-utils";
import { components } from "@/mdx-components";
import { Comment, Post } from "@/schema";
import { compile, run } from "@mdx-js/mdx";
import { eq, isNotNull } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import * as runtime from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import { ClipboardCopyButton } from "./_components/clipboard-copy-button";

// This enables dynamic rendering for comments
export const dynamic = "force-dynamic";

// Cache the database query for reuse
const getPost = cache(async (slug: string) => {
	const post = await db.query.Post.findFirst({ where: eq(Post.slug, slug) });
	if (!post) {
		notFound();
	}
	return post;
});

// Generate all possible slug values at build time
export async function generateStaticParams() {
	const posts = await db.query.Post.findMany({
		columns: {
			slug: true,
		},
		where: isNotNull(Post.publicAt),
	});

	return posts.map((post) => ({
		slug: post.slug,
	}));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const post = await getPost(slug);

	const description = await extractFirstParagraph(post.markdown);
	const baseUrl = env.VERCEL_PROJECT_PRODUCTION_URL
		? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
		: "https://blog-shud.vercel.app";

	const metadata: Metadata = {
		title: post.title,
		description: description.substring(0, 160),
		alternates: {
			canonical: `${baseUrl}/${post.slug}`,
			types: {
				"text/plain": `${baseUrl}/${post.slug}.md`,
			},
		},
		openGraph: {
			title: post.title,
			description: description.substring(0, 160),
			type: "article",
			url: `${baseUrl}/${post.slug}`,
			locale: post.locale === "is" ? "is_IS" : "en_US",
			publishedTime: post.publishedAt.toISOString(),
			modifiedTime: (post.modifiedAt ?? post.publishedAt).toISOString(),
			authors: ["Jökull Sólberg"],
		},
		twitter: {
			card: "summary_large_image",
			title: post.title,
			description: description.substring(0, 160),
		},
	};

	return metadata;
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const post = await getPost(slug);

	// Get user session and admin status
	const session = await getSession();
	const isAdminUser = await isAdmin();

	let user = null;
	if (session.githubUsername) {
		const githubUser = await getGithubUser(session.githubUsername);
		user = {
			email: "", // We don't need email for comments
			githubId: githubUser.id,
			githubUsername: githubUser.login,
			name: githubUser.name ?? githubUser.login,
			avatarUrl: githubUser.avatar_url,
		};
	}

	// Fetch comments for this post
	const comments = await db.query.Comment.findMany({
		where: eq(Comment.postSlug, slug),
		orderBy: [Comment.createdAt], // Oldest first (chronological order)
	});

	// Pre-render markdown content for each comment
	const commentsWithRenderedContent = await Promise.all(
		comments.map(async (comment) => {
			let renderedContent: React.ReactElement | null = null;

			try {
				const code = String(
					await compile(comment.content, {
						outputFormat: "function-body",
						remarkPlugins: [remarkGfm],
					}),
				);
				const module = (await run(code, {
					...runtime,
					baseUrl: import.meta.url,
				})) as {
					default: (props: { components: typeof components }) => React.ReactElement;
				};
				renderedContent = module.default({ components });
			} catch {
				renderedContent = null;
			}

			return {
				...comment,
				renderedContent,
			};
		}),
	);

	// Get visible comment count
	const visibleComments = commentsWithRenderedContent.filter(
		(comment) => !comment.isHidden || isAdminUser,
	);
	const commentCount = visibleComments.length;

	let mdx: React.ReactElement | null = null;
	try {
		const code = String(
			await compile(post.markdown, {
				outputFormat: "function-body",
				remarkPlugins: [remarkGfm],
			}),
		);
		const module = (await run(code, {
			...runtime,
			baseUrl: import.meta.url,
		})) as { default: (props: { components: typeof components }) => React.ReactElement };
		mdx = module.default({ components });
	} catch {
		mdx = null;
	}

	return (
		<div className="">
			<div className="mb-7">
				<h1 className="text-balance font-semibold">{post.title}</h1>
				<p className="text-sm">
					{post.publishedAt.toLocaleDateString(post.locale, {
						timeStyle: undefined,
						dateStyle: "long",
					})}
				</p>
				<ClipboardCopyButton text={post.markdown}>Copy as markdown</ClipboardCopyButton>
			</div>
			<ClientErrorBoundary>{mdx}</ClientErrorBoundary>

			<div className="mt-12 max-w-xl border-t pt-8">
				<CommentsSection
					postSlug={slug}
					user={user}
					comments={visibleComments}
					commentCount={commentCount}
					isAdmin={isAdminUser}
					currentUsername={session.githubUsername}
				/>
			</div>
		</div>
	);
}
