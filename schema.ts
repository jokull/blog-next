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
	heroImage: text("hero_image"),
});

export const Comment = sqliteTable("comment", {
	id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
	postSlug: text("post_slug")
		.notNull()
		.references(() => Post.slug),
	authorGithubId: integer("author_github_id", { mode: "number" }).notNull(),
	authorGithubUsername: text("author_github_username").notNull(),
	authorAvatarUrl: text("author_avatar_url").notNull(),
	content: text("content").notNull(),
	isHidden: integer("is_hidden", { mode: "boolean" }).default(false).notNull(),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.$default(() => new Date()),
});
