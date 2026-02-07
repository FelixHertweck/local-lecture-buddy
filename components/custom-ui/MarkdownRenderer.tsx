"use client";

import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

interface MarkdownRendererProps {
  content: string;
}

// Safely renders markdown content with HTML sanitization
export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{content}</ReactMarkdown>
    </div>
  );
}
