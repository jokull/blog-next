"use client";

import { formatCss, modeOklch, useMode } from "culori/fn";
import { useEffect, useRef } from "react";
import type { OklchColor } from "../../_lib/types";

// Note: `useMode` is a culori utility function, NOT a React hook
// It registers a color mode and returns a converter function
// eslint-disable-next-line react-hooks/rules-of-hooks
const oklch = useMode(modeOklch);

interface OklchSliderProps {
	label: string;
	value: number;
	min: number;
	max: number;
	step: number;
	color: OklchColor;
	onChange: (value: number) => void;
	channel: "l" | "c" | "h";
}

export function OklchSlider({
	label,
	value,
	min,
	max,
	step,
	color,
	onChange,
	channel,
}: OklchSliderProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	// Draw gradient background
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d", { willReadFrequently: false });
		if (!ctx) return;

		const width = canvas.width;
		const height = canvas.height;

		// Create gradient based on channel
		for (let x = 0; x < width; x++) {
			const t = x / (width - 1);
			const gradientValue = min + t * (max - min);

			// Build color with current channel modified
			const gradientColor = {
				...color,
				[channel]: gradientValue,
				mode: "oklch" as const,
			};

			// Convert to CSS and draw
			const cssColor = formatCss(oklch(gradientColor));
			ctx.fillStyle = cssColor;
			ctx.fillRect(x, 0, 1, height);
		}
	}, [color, channel, min, max]);

	const displayValue =
		channel === "l"
			? (value * 100).toFixed(0) + "%"
			: channel === "h"
				? value.toFixed(0) + "°"
				: value.toFixed(2);

	// Calculate marker position as percentage
	const markerPosition = ((value - min) / (max - min)) * 100;

	return (
		<div className="mb-2">
			<div className="flex items-center justify-between mb-2">
				<label className="text-xs font-semibold uppercase tracking-wider text-muted-fg">
					{label}
				</label>
				<span className="font-mono text-sm bg-muted/10 px-2 py-1 rounded">
					{displayValue}
				</span>
			</div>
			<div className="relative h-6">
				<canvas
					ref={canvasRef}
					width={300}
					height={32}
					className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg shadow-black/30 pointer-events-none"
				/>
				<div
					className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full border-black/60 border-[0.5px] pointer-events-none shadow-lg z-10"
					style={{ left: `${markerPosition}%`, transform: "translate(-50%, -50%)" }}
				/>
				<input
					type="range"
					min={min}
					max={max}
					step={step}
					value={value}
					onChange={(e) => {
						onChange(parseFloat(e.target.value));
					}}
					className="absolute top-0 left-0 w-full h-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-transparent [&::-webkit-slider-thumb]:border-none [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-transparent [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:active:cursor-grabbing"
				/>
			</div>
		</div>
	);
}
