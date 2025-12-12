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
        // Customize styling for better look in chat bubbles
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
          <code className="block bg-gray-100 p-3 rounded-lg text-xs font-mono mt-2 overflow-x-auto">
            {children}
          </code>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-primary/50 pl-4 italic my-3 text-muted-foreground">
            {children}
          </blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
