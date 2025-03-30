import { ClientErrorBoundary } from "@/components/error-boundary";
import { db } from "@/drizzle.config";
import { components } from "@/mdx-components";
import { Post } from "@/schema";
import { compile, run } from "@mdx-js/mdx";
import { eq, isNotNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import * as runtime from "react/jsx-runtime";

// This enables static rendering
// export const dynamic = "force-static";

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

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let post = await db.query.Post.findFirst({ where: eq(Post.slug, slug) });
  if (!post) {
    notFound();
  }

  let mdx;
  try {
    const code = String(
      await compile(post.markdown, {
        outputFormat: "function-body",
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
      </div>
      <ClientErrorBoundary>{mdx}</ClientErrorBoundary>
    </div>
  );
}
