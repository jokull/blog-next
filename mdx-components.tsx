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
  h1: (props) => (
    <h1
      className="font-semibold mb-7 text-rurikon-600 text-balance"
      {...props}
    />
  ),
  h2: (props) => (
    <h2
      className="font-semibold mt-14 mb-7 text-rurikon-600 text-balance"
      {...props}
    />
  ),
  h3: (props) => (
    <h3
      className="font-semibold mt-14 mb-7 text-rurikon-600 text-balance"
      {...props}
    />
  ),
  ul: (props) => (
    <ul
      className="mt-7 list-disc list-outside marker:text-rurikon-200 pl-5 max-w-xl"
      {...props}
    />
  ),
  ol: (props) => (
    <ol
      className="mt-7 list-decimal list-outside marker:text-rurikon-200 pl-5 max-w-xl"
      {...props}
    />
  ),
  li: (props) => <li className="pl-1.5" {...props} />,
  a: ({ href, ...props }) => {
    return (
      <Link
        className="break-words decoration-from-font underline underline-offset-2 decoration-rurikon-300 hover:decoration-rurikon-600 focus:outline-none focus-visible:rounded-xs focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-opacity-50 focus-visible:ring-offset-2"
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
      className="pl-6 -ml-6 sm:pl-10 sm:-ml-10 md:pl-14 md:-ml-14 not-mobile:text-rurikon-400 max-w-xl"
      {...props}
    />
  ),
  pre: (props) => (
    <pre
      className="mt-7 whitespace-pre md:whitespace-pre-wrap relative"
      {...props}
    />
  ),
  code: async (props) => {
    if (typeof props.children === "string") {
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
          {/* Copy button */}
          <span className="absolute top-3 right-4 [&>button]:decoration-0">
            <ClipboardCopyButton text={props.children}>
              Copy
            </ClipboardCopyButton>
          </span>
          <code
            className="inline shiki css-variables text-[0.805rem]"
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
          className="mt-7 rounded-xl max-w-[minmax(100%,576px)]"
          src={src}
          alt={alt}
          draggable={false}
        />
      );
    } else {
      const image = await import("./assets/images/" + src);
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
    }

    if (title) {
      return <BlockSideTitle title={title}>{img}</BlockSideTitle>;
    }

    return img;
  },
  hr: (props) => (
    <hr className="my-14 w-24 border-rurikon-border max-w-xl" {...props} />
  ),
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
