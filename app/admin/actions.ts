"use server";

import { requireAuth } from "@/auth";
import { db } from "@/drizzle.config";
import { Category, Post } from "@/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Category CRUD
export async function createCategory(slug: string, label: string) {
	await requireAuth();

	// Validate slug format
	if (!/^[a-z0-9-]+$/.test(slug)) {
		throw new Error("Slug must contain only lowercase letters, numbers, and hyphens");
	}

	// Check for duplicate
	const existing = await db.query.Category.findFirst({
		where: eq(Category.slug, slug),
	});
	if (existing) {
		throw new Error("Category slug already exists");
	}

	await db.insert(Category).values({ slug, label });
	revalidatePath("/admin");
}

export async function deleteCategory(slug: string) {
	await requireAuth();

	// Check post count
	const result = await db
		.select({ count: sql<number>`count(*)` })
		.from(Post)
		.where(eq(Post.categorySlug, slug));

	const count = result[0]?.count ?? 0;
	if (count > 0) {
		throw new Error(`Cannot delete category with ${count} post(s)`);
	}

	await db.delete(Category).where(eq(Category.slug, slug));
	revalidatePath("/admin");
}

// Post mutations
export async function togglePostPublished(slug: string) {
	await requireAuth();

	const post = await db.query.Post.findFirst({
		where: eq(Post.slug, slug),
	});

	if (!post) throw new Error("Post not found");

	await db
		.update(Post)
		.set({
			publicAt: post.publicAt ? null : new Date(),
			modifiedAt: new Date(),
		})
		.where(eq(Post.slug, slug));

	revalidatePath("/admin");
	revalidatePath("/(default)");
	revalidatePath(`/(default)/${slug}`);
}

export async function updatePostCategory(slug: string, categorySlug: string | null) {
	await requireAuth();

	// Validate category exists if not null
	if (categorySlug) {
		const category = await db.query.Category.findFirst({
			where: eq(Category.slug, categorySlug),
		});
		if (!category) throw new Error("Category not found");
	}

	await db
		.update(Post)
		.set({
			categorySlug,
			modifiedAt: new Date(),
		})
		.where(eq(Post.slug, slug));

	revalidatePath("/admin");
}
