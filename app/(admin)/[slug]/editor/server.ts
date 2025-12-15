"use server";

import { eq, type InferSelectModel } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { requireAuth } from "@/auth";
import { db } from "@/drizzle.config";
import { extractFirstImage } from "@/lib/mdx-image-extractor";
import { Post } from "@/schema";

async function getPostOrThrow(slug: string) {
	const post = await db.query.Post.findFirst({ where: eq(Post.slug, slug) });
	if (!post) {
		notFound();
	}
	return post;
}

export async function previewPost(
	slug: string,
	{ previewMarkdown }: Pick<InferSelectModel<typeof Post>, "previewMarkdown">,
) {
	await requireAuth();
	await getPostOrThrow(slug);

	const heroImage = previewMarkdown ? await extractFirstImage(previewMarkdown) : null;

	await db.update(Post).set({ previewMarkdown, heroImage }).where(eq(Post.slug, slug));
	revalidatePath("/(admin)/[slug]/editor", "page");
}

export async function togglePublishPost(slug: string) {
	await requireAuth();
	const post = await getPostOrThrow(slug);
	const isCurrentlyPublished = post.publicAt !== null;

	const newMarkdown = isCurrentlyPublished
		? post.markdown
		: (post.previewMarkdown ?? post.markdown);
	const heroImage = newMarkdown ? await extractFirstImage(newMarkdown) : post.heroImage;

	await db
		.update(Post)
		.set({
			publicAt: isCurrentlyPublished ? null : new Date(),
			markdown: newMarkdown,
			previewMarkdown: null,
			heroImage,
		})
		.where(eq(Post.slug, slug));

	revalidatePath("/(admin)/[slug]/editor", "page");
	revalidatePath("/(default)/[slug]", "page");
	revalidatePath("/(default)", "page");
}

export async function updatePost(
	slug: string,
	{
		title,
		publishedAt,
		locale,
		previewMarkdown,
	}: Pick<InferSelectModel<typeof Post>, "title" | "publishedAt" | "locale" | "previewMarkdown">,
) {
	await requireAuth();
	const post = await getPostOrThrow(slug);

	const newMarkdown = previewMarkdown ?? post.markdown;
	const heroImage = newMarkdown ? await extractFirstImage(newMarkdown) : post.heroImage;

	await db
		.update(Post)
		.set({
			title,
			publishedAt,
			locale,
			markdown: newMarkdown,
			previewMarkdown: null,
			heroImage,
			modifiedAt: new Date(),
		})
		.where(eq(Post.slug, slug));

	revalidatePath("/(admin)/[slug]/editor", "page");
	revalidatePath("/(default)/[slug]", "page");
	revalidatePath("/(default)", "page");
}
