"use client";

import { Button } from "@/app/_catalyst/button";
import { Input } from "@/app/_catalyst/input";
import { Select } from "@/app/_catalyst/select";
import { Post } from "@/schema";
import { default as MonacoEditor } from "@monaco-editor/react";
import { useDebouncedCallback } from "@tanstack/react-pacer/debouncer";
import { InferSelectModel } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { previewPost, togglePublishPost, updatePost } from "../server";
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

  const debouncedSavePreview = useDebouncedCallback(
    (value: string) => {
      previewPost(post.slug, { previewMarkdown: value });
    },
    {
      wait: 2000,
    }
  );

  const isTitleModified = post.title !== props.post.title;
  const isDateModified =
    post.publishedAt.getTime() !== props.post.publishedAt.getTime();
  const isLocaleModified = post.locale !== props.post.locale;
  const isMarkdownModified = post.previewMarkdown !== props.post.markdown;

  const unsavedChanges =
    isTitleModified || isDateModified || isLocaleModified || isMarkdownModified;

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [unsavedChanges]);

  const onChange = useCallback(
    (value: string | undefined) => {
      if (value) {
        setPost((prevPost) => ({ ...prevPost, previewMarkdown: value })); // Immediate local state update
        debouncedSavePreview(value); // Debounced server action
      }
    },
    [debouncedSavePreview]
  );

  return (
    <div className="h-[calc(100vh)] flex flex-col gap-2 px-2 py-6">
      <Input
        value={post.title}
        onChange={(event) => {
          setPost({ ...post, title: event.target.value });
        }}
      />
      <div className="flex gap-2 justify-end items-center">
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
          onSubmit={async (event) => {
            event.preventDefault();
            await togglePublishPost(post.slug);
          }}
        >
          <Button type="submit" color="emerald" className="relative group">
            <span className="invisible pointer-events-none select-none">
              Unpublished
            </span>
            <span className="group-hover:hidden absolute">
              {props.post.publicAt ? "Published" : "Unpublished"}
            </span>
            <span className="hidden group-hover:inline absolute">
              {props.post.publicAt ? "Unpublish" : "Publish"}
            </span>
          </Button>
        </form>
        <form
          className="contents"
          onSubmit={async (event) => {
            event.preventDefault();
            await updatePost(post.slug, {
              title: post.title,
              publishedAt: post.publishedAt,
              locale: post.locale,
              previewMarkdown: post.previewMarkdown,
            });
          }}
        >
          <Button type="submit" color="green" disabled={!unsavedChanges}>
            Save
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
