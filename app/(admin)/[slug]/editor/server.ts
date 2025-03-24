"use server";

import { db } from "@/drizzle.config";
import { Post } from "@/schema";
import { eq, InferSelectModel } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

type NonNullish<T> = {
  [K in keyof T]-?: Exclude<T[K], null | undefined>;
};

function revalidate() {
  revalidatePath("/(admin)/[slug]/editor", "page");
  revalidatePath("/(default)/[slug]");
  revalidatePath("/(default)");
}

export async function previewPost(
  slug: string,
  { previewMarkdown }: Pick<InferSelectModel<typeof Post>, "previewMarkdown">
) {
  const post = await db.query.Post.findFirst({ where: eq(Post.slug, slug) });
  if (!post) {
    notFound();
  }
  await db.update(Post).set({ previewMarkdown }).where(eq(Post.slug, slug));
  revalidate();
}

export async function publishPost(
  slug: string,
  {
    publishedAt,
    title,
    previewMarkdown,
    locale,
  }: NonNullish<
    Pick<
      InferSelectModel<typeof Post>,
      "publishedAt" | "title" | "previewMarkdown" | "locale"
    >
  >
) {
  const post = await db.query.Post.findFirst({ where: eq(Post.slug, slug) });

  if (!post) {
    notFound();
  }

  await db
    .update(Post)
    .set({
      markdown: previewMarkdown || post.markdown,
      previewMarkdown: null,
      publishedAt: publishedAt,
      title: title,
      publicAt: new Date(),
      locale: locale,
    })
    .where(eq(Post.slug, slug));
  revalidate();
}

export async function unpublishPost(slug: string) {
  const post = await db.query.Post.findFirst({ where: eq(Post.slug, slug) });

  if (!post) {
    notFound();
  }

  await db
    .update(Post)
    .set({
      publicAt: null,
    })
    .where(eq(Post.slug, slug));
  revalidate();
}
