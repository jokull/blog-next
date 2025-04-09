"use client";

import { useState } from "react";

export default function CopyAsMarkdown({ markdown }: { markdown: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy markdown:", err);
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs text-blue-500 hover:underline focus:outline-none"
    >
      {copied ? "Copied!" : "Copy as Markdown"}
    </button>
  );
}
