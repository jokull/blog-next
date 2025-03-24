"use client";

import { Button } from "@/app/_catalyst/button";
import { Input } from "@/app/_catalyst/input";
import { Select } from "@/app/_catalyst/select";
import { Post } from "@/schema";
import { default as MonacoEditor } from "@monaco-editor/react";
import { InferSelectModel } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { ReactNode, useCallback, useState } from "react";
import { publishPost, unpublishPost } from "../server";
import { DateInput } from "./date-input";
import { Preview } from "./preview";

const postSchema = createInsertSchema(Post);

export function Editor({
  mdx,
  ...props
}: {
  post: InferSelectModel<typeof Post>;
  mdx: ReactNode;
}) {
  const [post, setPost] = useState({
    ...props.post,
    previewMarkdown: props.post.previewMarkdown || props.post.markdown,
  });
  const onChange = useCallback((value: string | undefined) => {
    if (value) {
      setPost({ ...post, previewMarkdown: value });
    }
  }, []);
  return (
    <div className="h-[calc(100vh)] flex flex-col gap-2 px-2 py-6">
      <Input
        value={post.title}
        onChange={(event) => {
          setPost({ ...post, title: event.target.value });
        }}
      />
      <div className="flex gap-2 justify-end">
        <DateInput
          value={post.publishedAt.toISOString().slice(0, 10)}
          onChange={(value) => {
            if (!value) {
              return;
            }
            setPost({ ...post, publishedAt: new Date(value) });
          }}
        />
        <Select
          value={post.locale}
          onChange={(event) => {
            const localeResult = postSchema.shape.locale.safeParse(
              event.target.value
            );
            if (localeResult.data) {
              setPost({ ...post, locale: localeResult.data });
            }
          }}
        >
          {[
            ["en", "English"],
            ["is", "Íslenska"],
          ].map(([locale, label]) => (
            <option key={locale} value={locale}>
              {label}
            </option>
          ))}
        </Select>
        <Preview post={post}>{mdx}</Preview>
        <form
          className="contents"
          onSubmit={(event) => {
            event.preventDefault();
            publishPost(post.slug, {
              publishedAt: post.publishedAt,
              title: post.title,
              previewMarkdown: post.previewMarkdown,
              locale: post.locale,
            });
          }}
        >
          <Button
            type="submit"
            color="green"
            disabled={
              post.previewMarkdown === props.post.markdown &&
              post.publishedAt.valueOf() === props.post.publishedAt.valueOf() &&
              post.title === props.post.title &&
              post.locale === props.post.locale &&
              props.post.publicAt !== null
            }
          >
            Publish
          </Button>
        </form>
        <form
          className="contents"
          onSubmit={(event) => {
            event.preventDefault();
            unpublishPost(post.slug);
          }}
        >
          <Button type="submit" color="pink" disabled={!props.post.publicAt}>
            Unpublish
          </Button>
        </form>
      </div>
      <MonacoEditor
        width="100%"
        defaultLanguage="markdown"
        defaultValue={post.previewMarkdown || post.markdown}
        className=""
        onChange={onChange}
        options={{
          fontSize: 11,
          automaticLayout: true,
          trimAutoWhitespace: true,
          autoClosingQuotes: "always",
          autoClosingBrackets: "always",
          autoClosingOvertype: "always",
          autoIndent: "full",
          autoClosingComments: "always",
          cursorStyle: "line",
          lineNumbers: "off",
          minimap: { enabled: false },
          wordWrap: "on",
        }}
      />
    </div>
  );
}
