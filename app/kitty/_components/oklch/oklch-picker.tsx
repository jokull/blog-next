"use client";

import type { OklchColor } from "../../_lib/types";
import { OklchSlider } from "./oklch-slider";

interface OklchPickerProps {
	color: OklchColor;
	onChange: (color: OklchColor) => void;
	disabled?: boolean;
}

export function OklchPicker({ color, onChange, disabled }: OklchPickerProps) {
	const handleLChange = (l: number) => {
		if (!disabled) onChange({ ...color, l });
	};

	const handleCChange = (c: number) => {
		if (!disabled) onChange({ ...color, c });
	};

	const handleHChange = (h: number) => {
		if (!disabled) onChange({ ...color, h });
	};

	return (
		<div
			className={`bg-muted/5 rounded-lg ${disabled ? "opacity-50 pointer-events-none" : ""}`}
		>
			<OklchSlider
				label="Lightness"
				value={color.l}
				min={0}
				max={1}
				step={0.01}
				color={color}
				onChange={handleLChange}
				channel="l"
			/>
			<OklchSlider
				label="Chroma"
				value={color.c}
				min={0}
				max={0.37}
				step={0.001}
				color={color}
				onChange={handleCChange}
				channel="c"
			/>
			<OklchSlider
				label="Hue"
				value={color.h}
				min={0}
				max={360}
				step={1}
				color={color}
				onChange={handleHChange}
				channel="h"
			/>
		</div>
	);
}
