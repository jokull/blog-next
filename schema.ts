import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const Post = sqliteTable("post", {
  slug: text("slug").notNull().primaryKey(),
  title: text("title").notNull(),
  markdown: text("markdown").notNull(),
  previewMarkdown: text("preview_markdown"),
  publicAt: integer("public_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$default(() => new Date()),
  publishedAt: integer("published_at", { mode: "timestamp" }).notNull(),
  modifiedAt: integer("modified_at", { mode: "timestamp" }),
  locale: text("locale", { enum: ["is", "en"] })
    .default("en")
    .notNull(),
});
