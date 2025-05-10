import { ClientErrorBoundary } from "@/components/error-boundary";
import { db } from "@/drizzle.config";
import { components } from "@/mdx-components";
import { Post } from "@/schema";
import { compile, run } from "@mdx-js/mdx";
import { eq, isNotNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import { cache } from "react";
import * as runtime from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import { ClipboardCopyButton } from "./_components/clipboard-copy-button";

// This enables static rendering
export const dynamic = "force-static";

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
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  return {
    title: post.title,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  let mdx;
  try {
    const code = String(
      await compile(post.markdown, {
        outputFormat: "function-body",
        remarkPlugins: [remarkGfm],
      })
    );
    mdx = (
      await run(code, {
        ...runtime,
        baseUrl: import.meta.url,
      })
    ).default({ components });
  } catch {
    mdx = null;
  }

  return (
    <div className="">
      <div className="mb-7">
        <h1 className="font-semibold text-rurikon-600 text-balance">
          {post.title}
        </h1>
        <p className="text-sm">
          {post.publishedAt.toLocaleDateString(post.locale, {
            timeStyle: undefined,
            dateStyle: "long",
          })}
        </p>
        <ClipboardCopyButton text={post.markdown}>
          Copy as markdown
        </ClipboardCopyButton>
      </div>
      <ClientErrorBoundary>{mdx}</ClientErrorBoundary>
    </div>
  );
}
