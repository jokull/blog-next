"use client";

import { type ReactNode, useState } from "react";

export function ClipboardCopyButton({ text, children }: { text: string; children: ReactNode }) {
	const [copied, setCopied] = useState(false);

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => {
				setCopied(false);
			}, 2000); // Reset after 2 seconds
		} catch (_err) {}
	}

	return (
		<button
			type="button"
			onClick={() => {
				void handleCopy();
			}}
			className="text-blue-500 text-xs hover:underline focus:outline-none"
		>
			{copied ? "Copied!" : children}
		</button>
	);
}
