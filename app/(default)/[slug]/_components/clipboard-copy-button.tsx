"use client";

import { type ReactNode, useState } from "react";

export function ClipboardCopyButton({
	text,
	children,
}: {
	text: string;
	children: ReactNode;
}) {
	const [copied, setCopied] = useState(false);

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
		} catch (err) {
			console.error("Failed to copy markdown:", err);
		}
	}

	return (
		<button
			type="button"
			onClick={handleCopy}
			className="text-xs text-blue-500 hover:underline focus:outline-none"
		>
			{copied ? "Copied!" : children}
		</button>
	);
}
