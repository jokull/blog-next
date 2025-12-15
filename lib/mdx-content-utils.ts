import type { Paragraph } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { mdxFromMarkdown } from "mdast-util-mdx";
import { toString as mdastToString } from "mdast-util-to-string";
import { mdxjs } from "micromark-extension-mdxjs";
import { visit } from "unist-util-visit";
import { extractFirstImage } from "./mdx-image-extractor";

export async function extractFirstParagraph(markdown: string): Promise<string> {
	if (!markdown || typeof markdown !== "string") {
		return "";
	}

	try {
		const tree = fromMarkdown(markdown, {
			extensions: [mdxjs()],
			mdastExtensions: [mdxFromMarkdown()],
		});

		let firstParagraph: string = "";

		visit(tree, "paragraph", (node: Paragraph) => {
			if (!firstParagraph) {
				const text = mdastToString(node).trim();
				if (text && text.length > 0) {
					firstParagraph = text;
					return false;
				}
			}
		});

		return firstParagraph;
	} catch (_error) {
		return "";
	}
}

export async function processPostContent(markdown: string): Promise<{
	heroImage: string | null;
	excerpt: string;
}> {
	const [heroImage, excerpt] = await Promise.all([
		extractFirstImage(markdown),
		extractFirstParagraph(markdown),
	]);

	return {
		heroImage,
		excerpt: excerpt.substring(0, 160).trim() + (excerpt.length > 160 ? "..." : ""),
	};
}

export function truncateText(text: string, maxLength: number = 160): string {
	if (!text || text.length <= maxLength) {
		return text;
	}

	const truncated = text.substring(0, maxLength);
	const lastSpace = truncated.lastIndexOf(" ");

	if (lastSpace > maxLength * 0.8) {
		return `${truncated.substring(0, lastSpace)}...`;
	}

	return `${truncated}...`;
}
