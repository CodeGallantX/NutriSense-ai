/* eslint-disable @next/next/no-img-element */
// components/markdown-message.tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownMessageProps {
  content: string;
}

export default function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Text & basic elements
        p: ({ children }) => (
          <p className="text-sm leading-relaxed">{children}</p>
        ),
        strong: ({ children }) => (
          <strong className="font-medium">{children}</strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
        ul: ({ children }) => (
          <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside my-2 space-y-1">
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="ml-4">{children}</li>,
        a: ({ href, children }) => (
          <a href={href} className="text-primary underline hover:opacity-80">
            {children}
          </a>
        ),
        code: ({ children }) => (
          <code className="block bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-xs font-mono mt-2 overflow-x-auto">
            {children}
          </code>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-primary/50 pl-4 italic my-3 text-muted-foreground">
            {children}
          </blockquote>
        ),

        // Critical: Style images beautifully in chat
        img: ({ src, alt }) => (
          <img
            src={src}
            alt={alt || "Uploaded image"}
            className="max-w-full rounded-lg border border-gray-200 shadow-sm my-4 mx-auto block"
            style={{ maxHeight: "400px" }}
            loading="lazy"
          />
        ),

        // Optional: Style tables if you ever use them
        table: ({ children }) => (
          <div className="overflow-x-auto my-4">
            <table className="min-w-full divide-y divide-gray-300 border border-gray-200 rounded-lg">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-gray-50">{children}</thead>
        ),
        tbody: ({ children }) => (
          <tbody className="divide-y divide-gray-200 bg-white">{children}</tbody>
        ),
        tr: ({ children }) => (
          <tr>{children}</tr>
        ),
        th: ({ children }) => (
          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-3 py-2 text-sm text-gray-900">{children}</td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}