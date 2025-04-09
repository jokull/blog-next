import { db } from "@/drizzle.config";
import { Post } from "@/schema";
import { desc, isNotNull } from "drizzle-orm";
import Link from "next/link";
import { groupBy, pipe } from "remeda";

export const metadata = {
  title: "Jökull Sólberg",
};

export default async function Page() {
  const posts = await db.query.Post.findMany({
    where: isNotNull(Post.publicAt),
    orderBy: [desc(Post.publishedAt)],
  });

  // Group posts by year using Remeda
  const postsByYear = pipe(
    posts,
    groupBy((post) => post.publishedAt.getFullYear().toString())
  );

  return (
    <div className="max-w-xl">
      {Object.keys(postsByYear)
        .sort((a, b) => (b > a ? 1 : -1))
        .map((year) => (
          <div key={year} className="mb-7">
            <h2 className="font-light">{year}</h2>
            <ul>
              {postsByYear[year]!.map((item) => (
                <li key={item.slug} className="font-medium">
                  <Link
                    href={`/${item.slug}`}
                    className="group flex gap-1 justify-between items-end"
                    draggable={false}
                  >
                    <span className="block text-rurikon-500 group-hover:text-rurikon-700">
                      {item.title}
                    </span>
                    <span className="text-sm dot-leaders mb-[0.1rem] flex-1 text-rurikon-100 font-normal group-hover:text-rurikon-500 transition-colors group-hover:transition-none leading-none" />
                    <time className="block text-rurikon-200 tabular-nums font-normal tracking-tighter group-hover:text-rurikon-500 transition-colors group-hover:transition-none self-start whitespace-nowrap">
                      {item.publishedAt.toLocaleDateString(item.locale, {
                        year: undefined,
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
    </div>
  );
}
