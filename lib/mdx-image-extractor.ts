import type { Image, Parent } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import type { MdxJsxFlowElement } from "mdast-util-mdx";
import { mdxFromMarkdown } from "mdast-util-mdx";
import { mdxjs } from "micromark-extension-mdxjs";
import { visit } from "unist-util-visit";

interface ImageNode extends Image {
	type: "image";
}

function isImageNode(node: { type: string }): node is ImageNode {
	return node.type === "image";
}

interface JSXImageNode extends MdxJsxFlowElement {
	type: "mdxJsxFlowElement";
	name: "Image";
}

function isJSXImageNode(node: { type: string }): node is JSXImageNode {
	return node.type === "mdxJsxFlowElement" && "name" in node && node.name === "Image";
}

export async function extractFirstImage(markdown: string): Promise<string | null> {
	if (!markdown || typeof markdown !== "string") {
		return null;
	}

	try {
		const tree = fromMarkdown(markdown, {
			extensions: [mdxjs()],
			mdastExtensions: [mdxFromMarkdown()],
		});

		let firstImageSrc: string | null = null;

		visit(tree, (node, index, parent) => {
			if (firstImageSrc) return false;

			if (isImageNode(node)) {
				if (node.url && isTopLevel(parent, index)) {
					firstImageSrc = node.url;
					return false;
				}
			}

			if (isJSXImageNode(node)) {
				const srcAttr = node.attributes.find(
					(attr) => attr.type === "mdxJsxAttribute" && attr.name === "src",
				);

				if (
					srcAttr &&
					srcAttr.type === "mdxJsxAttribute" &&
					srcAttr.value &&
					isTopLevel(parent, index)
				) {
					const srcValue =
						typeof srcAttr.value === "string"
							? srcAttr.value
							: extractStringFromExpression(srcAttr.value.value);

					if (srcValue) {
						firstImageSrc = srcValue;
						return false;
					}
				}
			}
		});

		return firstImageSrc;
	} catch (_error) {
		return null;
	}
}

function isTopLevel(parent: Parent | undefined, index: number | undefined): boolean {
	if (!parent || index === undefined) return false;

	// If the parent is root, it's top level
	if (parent.type === "root") return true;

	// If the parent is a paragraph, we need to check if this paragraph
	// is a direct child of root. We can't rely on parent.parent from visit,
	// so we assume paragraphs are top-level unless they're nested in other structures
	if (parent.type === "paragraph") return true;

	return false;
}

function extractStringFromExpression(expression: string): string | null {
	try {
		const cleaned = expression.trim();
		if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
			return cleaned.slice(1, -1);
		}
		if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
			return cleaned.slice(1, -1);
		}
		return null;
	} catch {
		return null;
	}
}

export function normalizeImageUrl(imageSrc: string, baseUrl: string = ""): string {
	if (!imageSrc) return "";

	if (imageSrc.startsWith("http://") || imageSrc.startsWith("https://")) {
		return imageSrc;
	}

	if (imageSrc.startsWith("./assets/images/")) {
		const filename = imageSrc.replace("./assets/images/", "");
		return `${baseUrl}/assets/images/${filename}`;
	}

	if (imageSrc.startsWith("/")) {
		return `${baseUrl}${imageSrc}`;
	}

	return `${baseUrl}/${imageSrc}`;
}
