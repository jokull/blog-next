import { zValidator } from "@hono/zod-validator";
import { desc, eq } from "drizzle-orm";
import type { Context, Next } from "hono";
import { Hono } from "hono";
import { unsealData } from "iron-session";
import { z } from "zod/v4";
import { getSession } from "@/auth";
import { db } from "@/drizzle.config";
import { env } from "@/env";
import { Post } from "@/schema";

const app = new Hono().basePath("/api");

// Verify CLI token from Authorization header
async function verifyCliToken(token: string): Promise<string | null> {
	try {
		const data = await unsealData<{ githubUsername: string; type: string }>(token, {
			password: env.GITHUB_CLIENT_SECRET,
		});
		if (data.type === "cli" && data.githubUsername) {
			return data.githubUsername;
		}
		return null;
	} catch {
		return null;
	}
}

// Auth middleware - checks for admin access via session or CLI token
async function authMiddleware(c: Context, next: Next) {
	// First, check for Authorization header (CLI token)
	const authHeader = c.req.header("Authorization");
	if (authHeader?.startsWith("Bearer ")) {
		const token = authHeader.slice(7);
		const username = await verifyCliToken(token);
		if (username === "jokull") {
			await next();
			return;
		}
		return c.json({ error: "Unauthorized" }, 401);
	}

	// Fall back to cookie-based session
	const session = await getSession();
	if (!session.githubUsername || session.githubUsername !== "jokull") {
		return c.json({ error: "Unauthorized" }, 401);
	}
	await next();
}

// Schemas
const CreatePostSchema = z.object({
	slug: z.string(),
	title: z.string(),
	markdown: z.string(),
	locale: z.enum(["en", "is"]).default("en"),
	categorySlug: z.string().nullable().optional(),
	heroImage: z.string().nullable().optional(),
});

const UpdatePostSchema = z.object({
	title: z.string().optional(),
	markdown: z.string().optional(),
	locale: z.enum(["en", "is"]).optional(),
	categorySlug: z.string().nullable().optional(),
	heroImage: z.string().nullable().optional(),
	publish: z.boolean().optional(),
});

// Routes - must be chained for RPC type inference
const route = app
	.get("/posts", authMiddleware, async (c) => {
		const posts = await db.query.Post.findMany({
			orderBy: [desc(Post.publishedAt)],
		});
		return c.json({ posts });
	})
	.get("/posts/:slug", authMiddleware, async (c) => {
		const slug = c.req.param("slug");
		const post = await db.query.Post.findFirst({
			where: eq(Post.slug, slug),
		});
		if (!post) return c.json({ error: "Not found" }, 404);
		return c.json({ post });
	})
	.post("/posts", authMiddleware, zValidator("json", CreatePostSchema), async (c) => {
		const data = c.req.valid("json");
		await db.insert(Post).values({
			slug: data.slug,
			title: data.title,
			markdown: data.markdown,
			locale: data.locale,
			categorySlug: data.categorySlug ?? null,
			heroImage: data.heroImage ?? null,
			publishedAt: new Date(),
		});
		return c.json({ success: true, slug: data.slug });
	})
	.patch("/posts/:slug", authMiddleware, zValidator("json", UpdatePostSchema), async (c) => {
		const slug = c.req.param("slug");
		const data = c.req.valid("json");

		const updateData: Record<string, unknown> = { modifiedAt: new Date() };
		if (data.title !== undefined) updateData.title = data.title;
		if (data.markdown !== undefined) updateData.markdown = data.markdown;
		if (data.locale !== undefined) updateData.locale = data.locale;
		if (data.categorySlug !== undefined) updateData.categorySlug = data.categorySlug;
		if (data.heroImage !== undefined) updateData.heroImage = data.heroImage;
		if (data.publish === true) updateData.publicAt = new Date();
		if (data.publish === false) updateData.publicAt = null;

		await db.update(Post).set(updateData).where(eq(Post.slug, slug));
		return c.json({ success: true });
	})
	.delete("/posts/:slug", authMiddleware, async (c) => {
		const slug = c.req.param("slug");
		await db.delete(Post).where(eq(Post.slug, slug));
		return c.json({ success: true });
	})
	.get("/categories", authMiddleware, async (c) => {
		const categories = await db.query.Category.findMany();
		return c.json({ categories });
	});

export type AppType = typeof route;
export { app };
