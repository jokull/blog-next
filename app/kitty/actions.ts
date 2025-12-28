"use server";

import { requireAuth, getSession, isAdmin, getGithubUser } from "@/auth";
import { db } from "@/drizzle.config";
import { KittyTheme } from "@/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { KittyTheme as KittyThemeType } from "./_lib/types";

function generateSlug(name: string): string {
	return (
		name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "") +
		"-" +
		Date.now().toString(36)
	);
}

// Fetch published themes (public)
export async function getPublishedThemes(): Promise<KittyThemeType[]> {
	const themes = await db.query.KittyTheme.findMany({
		where: eq(KittyTheme.isPublished, true),
		orderBy: [desc(KittyTheme.createdAt)],
	});

	return themes.map(
		(t): KittyThemeType => ({
			...t,
			blurb: t.blurb ?? null,
			colors: t.colors as KittyThemeType["colors"],
		}),
	);
}

// Fetch user's themes (auth required)
export async function getUserThemes(): Promise<KittyThemeType[]> {
	const session = await getSession();
	if (!session.githubUsername) return [];

	const themes = await db.query.KittyTheme.findMany({
		where: eq(KittyTheme.authorGithubUsername, session.githubUsername),
		orderBy: [desc(KittyTheme.createdAt)],
	});

	return themes.map(
		(t): KittyThemeType => ({
			...t,
			blurb: t.blurb ?? null,
			colors: t.colors as KittyThemeType["colors"],
		}),
	);
}

// Create new theme (auth required)
export async function createTheme(data: {
	name: string;
	colors: KittyThemeType["colors"];
	blurb?: string;
}) {
	await requireAuth();
	const session = await getSession();
	const githubUser = await getGithubUser(session.githubUsername!);

	const slug = generateSlug(data.name);

	const theme = await db
		.insert(KittyTheme)
		.values({
			slug,
			name: data.name,
			blurb: data.blurb ?? null,
			colors: data.colors,
			authorGithubId: githubUser.id,
			authorGithubUsername: githubUser.login,
			authorAvatarUrl: githubUser.avatar_url,
			isPublished: false,
		})
		.returning();

	revalidatePath("/kitty");
	return {
		...theme[0],
		blurb: theme[0].blurb ?? null,
		colors: theme[0].colors as KittyThemeType["colors"],
	} as KittyThemeType;
}

// Update theme (owner or admin)
export async function updateTheme(
	id: number,
	updates: Partial<{
		name: string;
		blurb: string | null;
		colors: KittyThemeType["colors"];
	}>,
) {
	const session = await getSession();
	if (!session.githubUsername) throw new Error("Auth required");

	const theme = await db.query.KittyTheme.findFirst({
		where: eq(KittyTheme.id, id),
	});

	if (!theme) throw new Error("Theme not found");

	const isOwner = theme.authorGithubUsername === session.githubUsername;
	const isAdminUser = await isAdmin();
	if (!isOwner && !isAdminUser) throw new Error("Unauthorized");

	const updated = await db
		.update(KittyTheme)
		.set({
			...updates,
			colors: updates.colors,
			modifiedAt: new Date(),
		})
		.where(eq(KittyTheme.id, id))
		.returning();

	revalidatePath("/kitty");
	return {
		...updated[0],
		blurb: updated[0].blurb ?? null,
		colors: updated[0].colors as KittyThemeType["colors"],
	} as KittyThemeType;
}

// Toggle publish state (owner or admin)
export async function togglePublish(id: number) {
	const session = await getSession();
	if (!session.githubUsername) throw new Error("Auth required");

	const theme = await db.query.KittyTheme.findFirst({
		where: eq(KittyTheme.id, id),
	});

	if (!theme) throw new Error("Theme not found");

	const isOwner = theme.authorGithubUsername === session.githubUsername;
	const isAdminUser = await isAdmin();
	if (!isOwner && !isAdminUser) throw new Error("Unauthorized");

	const updated = await db
		.update(KittyTheme)
		.set({ isPublished: !theme.isPublished, modifiedAt: new Date() })
		.where(eq(KittyTheme.id, id))
		.returning();

	revalidatePath("/kitty");
	return {
		...updated[0],
		blurb: updated[0].blurb ?? null,
		colors: updated[0].colors as KittyThemeType["colors"],
	} as KittyThemeType;
}

// Fork theme (auth required, source must be published)
export async function forkTheme(originalId: number) {
	await requireAuth();
	const session = await getSession();

	const original = await db.query.KittyTheme.findFirst({
		where: eq(KittyTheme.id, originalId),
	});

	if (!original) throw new Error("Theme not found");
	if (!original.isPublished) throw new Error("Cannot fork unpublished theme");

	const githubUser = await getGithubUser(session.githubUsername!);

	const forked = await db
		.insert(KittyTheme)
		.values({
			slug: generateSlug(`${original.name} remix`),
			name: `${original.name} (Remix)`,
			blurb: original.blurb ?? null,
			colors: original.colors,
			authorGithubId: githubUser.id,
			authorGithubUsername: githubUser.login,
			authorAvatarUrl: githubUser.avatar_url,
			forkedFromId: original.id,
			isPublished: false,
		})
		.returning();

	revalidatePath("/kitty");
	return {
		...forked[0],
		blurb: forked[0].blurb ?? null,
		colors: forked[0].colors as KittyThemeType["colors"],
	} as KittyThemeType;
}

// Delete theme (owner or admin)
export async function deleteTheme(id: number) {
	const session = await getSession();
	if (!session.githubUsername) throw new Error("Auth required");

	const theme = await db.query.KittyTheme.findFirst({
		where: eq(KittyTheme.id, id),
	});

	if (!theme) throw new Error("Theme not found");

	const isOwner = theme.authorGithubUsername === session.githubUsername;
	const isAdminUser = await isAdmin();
	if (!isOwner && !isAdminUser) throw new Error("Unauthorized");

	await db.delete(KittyTheme).where(eq(KittyTheme.id, id));

	revalidatePath("/kitty");
}

// Get single theme by slug
export async function getThemeBySlug(slug: string): Promise<KittyThemeType | null> {
	const theme = await db.query.KittyTheme.findFirst({
		where: eq(KittyTheme.slug, slug),
	});

	if (!theme) return null;

	return {
		...theme,
		blurb: theme.blurb ?? null,
		colors: theme.colors as KittyThemeType["colors"],
	} as KittyThemeType;
}

// Get forked from theme info
export async function getForkedFromTheme(forkedFromId: number): Promise<KittyThemeType | null> {
	const theme = await db.query.KittyTheme.findFirst({
		where: eq(KittyTheme.id, forkedFromId),
	});

	if (!theme) return null;

	return {
		...theme,
		blurb: theme.blurb ?? null,
		colors: theme.colors as KittyThemeType["colors"],
	} as KittyThemeType;
}

// Get single theme by ID (with permission check)
// Returns theme if: published OR owned by current user OR user is admin
export async function getThemeById(id: number): Promise<KittyThemeType | null> {
	const theme = await db.query.KittyTheme.findFirst({
		where: eq(KittyTheme.id, id),
	});

	if (!theme) return null;

	// Published themes are always visible
	if (theme.isPublished) {
		return {
			...theme,
			blurb: theme.blurb ?? null,
			colors: theme.colors as KittyThemeType["colors"],
		} as KittyThemeType;
	}

	// For unpublished themes, check ownership/admin status
	const session = await getSession();
	const isOwner = theme.authorGithubUsername === session.githubUsername;
	const isAdminUser = await isAdmin();

	if (!isOwner && !isAdminUser) {
		return null; // Treat as not found for unauthorized users
	}

	return {
		...theme,
		blurb: theme.blurb ?? null,
		colors: theme.colors as KittyThemeType["colors"],
	} as KittyThemeType;
}
