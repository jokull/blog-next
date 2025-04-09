"use server";

import { requireAuth } from "@/auth";
import { db } from "@/drizzle.config";
import { Post } from "@/schema";
import { eq, InferSelectModel } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

async function getPostOrThrow(slug: string) {
  const post = await db.query.Post.findFirst({ where: eq(Post.slug, slug) });
  if (!post) {
    notFound();
  }
  return post;
}

export async function previewPost(
  slug: string,
  { previewMarkdown }: Pick<InferSelectModel<typeof Post>, "previewMarkdown">
) {
  await requireAuth();
  await getPostOrThrow(slug);
  await db.update(Post).set({ previewMarkdown }).where(eq(Post.slug, slug));
  revalidatePath("/(admin)/[slug]/editor", "page");
}

export async function togglePublishPost(slug: string) {
  await requireAuth();
  const post = await getPostOrThrow(slug);
  const isCurrentlyPublished = post.publicAt !== null;

  await db
    .update(Post)
    .set({
      publicAt: isCurrentlyPublished ? null : new Date(),
      markdown: isCurrentlyPublished
        ? post.markdown
        : post.previewMarkdown || post.markdown,
      previewMarkdown: null,
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
  }: Pick<
    InferSelectModel<typeof Post>,
    "title" | "publishedAt" | "locale" | "previewMarkdown"
  >
) {
  await requireAuth();
  const post = await getPostOrThrow(slug);
  await db
    .update(Post)
    .set({
      title,
      publishedAt,
      locale,
      markdown: previewMarkdown || post.markdown,
      previewMarkdown: null,
      modifiedAt: new Date(),
    })
    .where(eq(Post.slug, slug));

  revalidatePath("/(admin)/[slug]/editor", "page");
  revalidatePath("/(default)/[slug]", "page");
  revalidatePath("/(default)", "page");
}
