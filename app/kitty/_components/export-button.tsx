"use client";

import { useState } from "react";
import type { KittyTheme } from "../_lib/types";
import { oklchToString } from "../_lib/color-utils";
import { colorLabels } from "../_lib/types";
import { Button } from "@/components/ui/button";

interface ExportButtonProps {
	theme: KittyTheme | null;
}

export function ExportButton({ theme }: ExportButtonProps) {
	const [copied, setCopied] = useState(false);

	const generateConfig = () => {
		if (!theme) return "";

		const lines: string[] = [];

		lines.push(`## name: ${theme.name}`);
		if (theme.authorGithubUsername) {
			lines.push(`## author: ${theme.authorGithubUsername}`);
		}
		if (theme.blurb) {
			lines.push(`## blurb: ${theme.blurb}`);
		}
		lines.push("");
		lines.push("# Use Display P3 for wide gamut");
		lines.push("macos_colorspace displayp3");
		lines.push("");
		lines.push("# ANSI colors (OKLCH - adjust L/C/H independently)");

		for (let i = 0; i <= 15; i++) {
			const key = `color${i}` as keyof typeof theme.colors;
			const color = theme.colors[key];
			const label = colorLabels[key];
			const paddedKey = key.padEnd(8);
			lines.push(`${paddedKey} ${oklchToString(color)}    # ${label}`);
		}

		lines.push("");
		lines.push("# Basic colors (OKLCH - perceptually uniform)");
		lines.push(`foreground               ${oklchToString(theme.colors.foreground)}`);
		lines.push(`background               ${oklchToString(theme.colors.background)}`);
		lines.push(`cursor                   ${oklchToString(theme.colors.cursor)}`);
		lines.push(`cursor_text_color        background`);
		lines.push(`selection_foreground     ${oklchToString(theme.colors.selection_foreground)}`);
		lines.push(`selection_background     ${oklchToString(theme.colors.selection_background)}`);

		return lines.join("\n");
	};

	const handleCopy = async () => {
		const config = generateConfig();
		await navigator.clipboard.writeText(config);
		setCopied(true);
		setTimeout(() => {
			setCopied(false);
		}, 2000);
	};

	if (!theme) return null;

	return (
		<Button
			intent="primary"
			onPress={() => {
				void handleCopy();
			}}
			size="sm"
		>
			{copied ? "Copied!" : "Copy to Clipboard"}
		</Button>
	);
}
