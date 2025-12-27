export interface OklchColor {
	l: number; // Lightness (0-1)
	c: number; // Chroma
	h: number; // Hue (0-360)
}

export interface KittyTheme {
	id: number | null;
	slug: string;
	name: string;
	authorGithubId: number;
	authorGithubUsername: string;
	authorAvatarUrl: string;
	blurb: string | null;
	isPublished: boolean;
	forkedFromId: number | null;
	createdAt: Date;
	modifiedAt: Date | null;

	// All 21 colors
	colors: {
		color0: OklchColor; // Black
		color1: OklchColor; // Red
		color2: OklchColor; // Green
		color3: OklchColor; // Yellow
		color4: OklchColor; // Blue
		color5: OklchColor; // Magenta
		color6: OklchColor; // Cyan
		color7: OklchColor; // White
		color8: OklchColor; // Bright Black
		color9: OklchColor; // Bright Red
		color10: OklchColor; // Bright Green
		color11: OklchColor; // Bright Yellow
		color12: OklchColor; // Bright Blue
		color13: OklchColor; // Bright Magenta
		color14: OklchColor; // Bright Cyan
		color15: OklchColor; // Bright White
		foreground: OklchColor;
		background: OklchColor;
		cursor: OklchColor;
		selection_foreground: OklchColor;
		selection_background: OklchColor;
	};
}

export type ColorKey = keyof KittyTheme["colors"];

export const colorLabels: Record<ColorKey, string> = {
	color0: "Black",
	color1: "Red",
	color2: "Green",
	color3: "Yellow",
	color4: "Blue",
	color5: "Magenta",
	color6: "Cyan",
	color7: "White",
	color8: "Bright Black",
	color9: "Bright Red",
	color10: "Bright Green",
	color11: "Bright Yellow",
	color12: "Bright Blue",
	color13: "Bright Magenta",
	color14: "Bright Cyan",
	color15: "Bright White",
	foreground: "Foreground",
	background: "Background",
	cursor: "Cursor",
	selection_foreground: "Selection Foreground",
	selection_background: "Selection Background",
};
