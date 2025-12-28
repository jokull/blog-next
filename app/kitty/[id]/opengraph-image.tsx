import { formatHex, oklch } from "culori";
import { readFileSync } from "fs";
import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { join } from "path";
import { getThemeById } from "../actions";
import type { OklchColor } from "../_lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fontBoldData = readFileSync(join(process.cwd(), "app/_fonts/Inter-Bold.ttf"));
const fontMediumData = readFileSync(join(process.cwd(), "app/_fonts/Inter-Medium.ttf"));

function oklchToHex(color: OklchColor): string {
	const result = formatHex(oklch({ l: color.l, c: color.c, h: color.h }));
	return result ?? "#808080";
}

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function Image({ params }: PageProps) {
	const { id } = await params;
	const themeId = parseInt(id, 10);

	if (isNaN(themeId)) {
		notFound();
	}

	const theme = await getThemeById(themeId);
	if (!theme) {
		notFound();
	}

	const bgColor = oklchToHex(theme.colors.background);
	const fgColor = oklchToHex(theme.colors.foreground);

	// Get the 12 main ANSI colors for display (excluding black/white variants)
	const ansiColors: Array<{ key: string; color: OklchColor }> = [
		{ key: "red", color: theme.colors.color1 },
		{ key: "green", color: theme.colors.color2 },
		{ key: "yellow", color: theme.colors.color3 },
		{ key: "blue", color: theme.colors.color4 },
		{ key: "magenta", color: theme.colors.color5 },
		{ key: "cyan", color: theme.colors.color6 },
		{ key: "brightRed", color: theme.colors.color9 },
		{ key: "brightGreen", color: theme.colors.color10 },
		{ key: "brightYellow", color: theme.colors.color11 },
		{ key: "brightBlue", color: theme.colors.color12 },
		{ key: "brightMagenta", color: theme.colors.color13 },
		{ key: "brightCyan", color: theme.colors.color14 },
	];

	const title = theme.name || "Kitty Theme Builder";
	const author = theme.authorGithubUsername;

	return new ImageResponse(
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				width: "100%",
				height: "100%",
				backgroundColor: bgColor,
				padding: 60,
				fontFamily: "Inter",
			}}
		>
			{/* Color swatches row */}
			<div
				style={{
					display: "flex",
					gap: 12,
					marginBottom: 40,
				}}
			>
				{ansiColors.map(({ key, color }) => (
					<div
						key={key}
						style={{
							width: 72,
							height: 72,
							borderRadius: 12,
							backgroundColor: oklchToHex(color),
						}}
					/>
				))}
			</div>

			{/* Theme name */}
			<div
				style={{
					fontSize: 64,
					fontWeight: 700,
					color: fgColor,
					lineHeight: 1.2,
					marginTop: "auto",
				}}
			>
				{title}
			</div>

			{/* Author and branding */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginTop: 24,
				}}
			>
				<div
					style={{
						fontSize: 28,
						fontWeight: 500,
						color: fgColor,
						opacity: 0.7,
					}}
				>
					{author ? `by ${author}` : "Kitty Theme Builder"}
				</div>
				<div
					style={{
						fontSize: 24,
						fontWeight: 500,
						color: fgColor,
						opacity: 0.5,
					}}
				>
					solberg.is/kitty
				</div>
			</div>
		</div>,
		{
			...size,
			fonts: [
				{
					name: "Inter",
					data: fontBoldData,
					style: "normal",
					weight: 700,
				},
				{
					name: "Inter",
					data: fontMediumData,
					style: "normal",
					weight: 500,
				},
			],
		},
	);
}
