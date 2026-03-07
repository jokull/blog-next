import { oklch } from "culori";
import { z } from "zod";
import { isColorKey } from "./types";
import type { KittyTheme, OklchColor } from "./types";

export function hexToOklchColor(hex: string): OklchColor {
	try {
		const color = oklch(hex);

		if (!color) {
			// eslint-disable-next-line no-console
			console.warn("Failed to convert color:", hex);
			return { l: 0.5, c: 0.1, h: 0 };
		}

		const l = typeof color.l === "number" ? color.l : 0.5;
		const c = typeof color.c === "number" ? color.c : 0.1;
		const h = typeof color.h === "number" ? color.h : 0;

		return { l, c, h };
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error("Error converting color:", hex, error);
		return { l: 0.5, c: 0.1, h: 0 };
	}
}

const themeMetadataSchema = z.object({
	name: z.string(),
	file: z.string(),
	is_dark: z.boolean().optional(),
	author: z.string().optional(),
	blurb: z.string().optional(),
	license: z.string().optional(),
	upstream: z.string().optional(),
});

export type ThemeMetadata = z.infer<typeof themeMetadataSchema>;

export async function fetchThemesList(): Promise<ThemeMetadata[]> {
	const response = await fetch(
		"https://raw.githubusercontent.com/kovidgoyal/kitty-themes/master/themes.json",
	);
	return z.array(themeMetadataSchema).parse(await response.json());
}

export async function fetchThemeConfig(file: string): Promise<string> {
	const response = await fetch(
		`https://raw.githubusercontent.com/kovidgoyal/kitty-themes/master/${file}`,
	);
	return response.text();
}

export function parseThemeConfig(
	configText: string,
): Partial<Pick<KittyTheme, "name" | "blurb" | "colors">> {
	const lines = configText.split("\n");
	const colors: Partial<KittyTheme["colors"]> = {};
	const theme: Partial<Pick<KittyTheme, "name" | "blurb" | "colors">> = {};

	let name = "";
	let author = "";
	let blurb = "";

	for (const line of lines) {
		const trimmed = line.trim();

		// Parse metadata comments
		if (trimmed.startsWith("## name:")) {
			name = trimmed.replace("## name:", "").trim();
		} else if (trimmed.startsWith("## author:")) {
			author = trimmed.replace("## author:", "").trim();
		} else if (trimmed.startsWith("## blurb:")) {
			blurb = trimmed.replace("## blurb:", "").trim();
		}

		// Parse color definitions
		const colorMatch = trimmed.match(
			/^(color\d+|foreground|background|cursor|selection_foreground|selection_background)\s+(.+)$/,
		);
		if (colorMatch) {
			const [, key, value] = colorMatch;
			const hexValue = value.trim();

			if (hexValue.startsWith("#") && isColorKey(key)) {
				colors[key] = hexToOklchColor(hexValue);
			} else if (hexValue === "background") {
				continue;
			}
		}
	}

	if (name) theme.name = name;
	if (blurb) theme.blurb = author ? `${blurb} by ${author}` : blurb;
	// oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion
	if (Object.keys(colors).length > 0) theme.colors = colors as KittyTheme["colors"];

	return theme;
}
