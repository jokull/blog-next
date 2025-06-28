"use client";

import { type ClassValue, clsx } from "clsx";
import { composeRenderProps } from "react-aria-components";
import { type ClassNameValue, twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

function composeTailwindRenderProps<T>(
	className: string | ((v: T) => string) | undefined,
	tailwind: ClassNameValue,
): string | ((v: T) => string) {
	return composeRenderProps(className, (className) => twMerge(tailwind, className));
}

export { composeTailwindRenderProps };
