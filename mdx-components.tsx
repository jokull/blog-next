import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import Link from "next/link";
import type { FC } from "react";
import { codeToHtml, createCssVariablesTheme } from "shiki";

import { ClipboardCopyButton } from "./app/(default)/[slug]/_components/clipboard-copy-button";
import { BlockSideTitle } from "./components/block-sidetitle";
import { PhotoCaption } from "./components/photo-caption";
import { Tool } from "./components/tool";
import { Card } from "./components/tweet-card";

const cssVariablesTheme = createCssVariablesTheme({});

export const components: Record<string, FC<any>> = {
	h1: (props) => <h1 className="mb-7 text-balance font-semibold text-neutral-600" {...props} />,
	h2: (props) => (
		<h2 className="mt-14 mb-7 text-balance font-semibold text-neutral-600" {...props} />
	),
	h3: (props) => (
		<h3 className="mt-14 mb-7 text-balance font-semibold text-neutral-600" {...props} />
	),
	ul: (props) => (
		<ul
			className="mt-7 max-w-xl list-outside list-disc pl-5 marker:text-neutral-300"
			{...props}
		/>
	),
	ol: (props) => (
		<ol
			className="mt-7 max-w-xl list-outside list-decimal pl-5 marker:text-neutral-300"
			{...props}
		/>
	),
	li: (props) => <li className="pl-1.5" {...props} />,
	a: ({ href, ...props }) => {
		return (
			<Link
				className="break-words underline decoration-blue-300 decoration-from-font underline-offset-2 hover:decoration-blue-600 focus:outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-opacity-50 focus-visible:ring-offset-2"
				href={href}
				draggable={false}
				{...(href?.startsWith("https://")
					? {
							target: "_blank",
							rel: "noopener noreferrer",
						}
					: {})}
				{...props}
			/>
		);
	},
	strong: (props) => <strong className="font-bold" {...props} />,
	p: (props) => <p className="mt-7 max-w-xl" {...props} />,
	blockquote: (props) => (
		<blockquote
			className="-ml-6 sm:-ml-10 md:-ml-14 max-w-xl pl-6 not-mobile:text-blue-400 sm:pl-10 md:pl-14"
			{...props}
		/>
	),
	pre: (props) => (
		<pre
			className="relative mt-7 max-w-3xl whitespace-pre rounded-sm border border-neutral-950/10 px-4 py-3.5 shadow-xl/5 md:whitespace-pre-wrap"
			{...props}
		/>
	),
	code: async (props) => {
		if (typeof props.children === "string") {
			// Check if this is a code block (multi-line) or inline code (single line)
			const isCodeBlock = props.children.includes("\n") || props.children.length > 50;

			const code = await codeToHtml(props.children, {
				lang: "jsx",
				theme: cssVariablesTheme,
				// theme: 'min-light',
				// theme: 'snazzy-light',
				transformers: [
					{
						// Since we're using dangerouslySetInnerHTML, the code and pre
						// tags should be removed.
						pre: (hast) => {
							if (hast.children.length !== 1) {
								throw new Error("<pre>: Expected a single <code> child");
							}
							if (hast.children[0].type !== "element") {
								throw new Error("<pre>: Expected a <code> child");
							}
							return hast.children[0];
						},
						postprocess(html) {
							return html.replace(/^<code>|<\/code>$/g, "");
						},
					},
				],
			});

			return (
				<>
					{/* Copy button - only show for code blocks, not inline code */}
					{isCodeBlock && (
						<span className="absolute right-2.5 bottom-2.5 rounded-xs border bg-white/5 px-2 py-px font-medium font-sans text-xs leading-0 backdrop-blur-md [&>button]:text-neutral-500 [&>button]:decoration-0">
							<ClipboardCopyButton text={props.children}>Copy</ClipboardCopyButton>
						</span>
					)}
					<code
						className="shiki css-variables inline text-[0.805rem]"
						// biome-ignore lint/security/noDangerouslySetInnerHtml: I know what I'm doing
						dangerouslySetInnerHTML={{ __html: code }}
					/>
				</>
			);
		}

		return <code className="inline" {...props} />;
	},
	Card,
	Image,
	img: async ({ src, alt, title }) => {
		let img: React.ReactNode;

		if (src.startsWith("https://")) {
			img = (
				<img
					className="mt-7 max-w-[minmax(100%,576px)] rounded-xl"
					src={src}
					alt={alt}
					draggable={false}
				/>
			);
		} else {
			try {
				const image = await import(`./assets/images/${src}`);
				img = (
					<Image
						key={src}
						className="mt-7 rounded-xl"
						src={image.default}
						alt={alt}
						quality={95}
						placeholder="blur"
						draggable={false}
					/>
				);
			} catch (_error) {
				// Fallback for missing images
				img = (
					<div className="mt-7 rounded-xl border bg-gray-100 p-4">
						<p>Image not found: {src}</p>
					</div>
				);
			}
		}

		if (title) {
			return <BlockSideTitle title={title}>{img}</BlockSideTitle>;
		}

		return img;
	},
	hr: (props) => <hr className="my-14 w-24 max-w-xl border-blue-border" {...props} />,
	BlockSideTitle,
	Tool,
	PhotoCaption,
};

export function useMDXComponents(inherited: MDXComponents): MDXComponents {
	return {
		...inherited,
		...components,
	};
}
