import type { ThemeMetadata } from "./theme-parser";

/**
 * Convert a community theme file path to a URL-friendly slug.
 * "themes/NightOwl.conf" -> "nightowl"
 * "themes/Catppuccin-Mocha.conf" -> "catppuccin-mocha"
 */
export function communityFileToSlug(file: string): string {
	return file
		.replace(/^themes\//, "") // Remove "themes/" prefix
		.replace(/\.conf$/, "") // Remove ".conf" suffix
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
		.replace(/^-+|-+$/g, ""); // Trim leading/trailing hyphens
}

/**
 * Find a community theme by its URL slug.
 * Returns the ThemeMetadata if found, null otherwise.
 */
export function findCommunityThemeBySlug(
	themes: ThemeMetadata[],
	slug: string,
): ThemeMetadata | null {
	return themes.find((t) => communityFileToSlug(t.file) === slug) ?? null;
}
