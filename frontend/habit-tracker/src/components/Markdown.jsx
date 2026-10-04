import ReactMarkdown from "react-markdown";

const components = {
  p: (props) => <p className="mb-3 last:mb-0" {...props} />,
  strong: (props) => <strong className="font-semibold text-fg" {...props} />,
  em: (props) => <em className="italic" {...props} />,
  ul: (props) => <ul className="my-3 list-disc space-y-1 pl-5" {...props} />,
  ol: (props) => <ol className="my-3 list-decimal space-y-1 pl-5" {...props} />,
  li: (props) => <li {...props} />,
  h1: (props) => <h3 className="mb-1 mt-4 text-[15px] font-semibold text-fg" {...props} />,
  h2: (props) => <h3 className="mb-1 mt-4 text-[15px] font-semibold text-fg" {...props} />,
  h3: (props) => <h3 className="mb-1 mt-4 text-[15px] font-semibold text-fg" {...props} />,
  blockquote: (props) => (
    <blockquote className="my-3 border-l-2 border-line-strong pl-3 text-muted" {...props} />
  ),
  code: ({ inline, ...props }) =>
    inline ? (
      <code className="rounded bg-fill px-1.5 py-0.5 font-mono text-[0.85em]" {...props} />
    ) : (
      <code className="block overflow-x-auto rounded-lg bg-fill p-3 font-mono text-[0.85em]" {...props} />
    ),
  a: ({ href, ...rest }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-fg underline underline-offset-2"
      {...rest}
    />
  ),
  hr: () => <hr className="my-4 border-line" />,
};

export default function Markdown({ children, className = "" }) {
  return (
    <div className={`leading-relaxed text-fg-2 ${className}`}>
      <ReactMarkdown components={components}>{children || ""}</ReactMarkdown>
    </div>
  );
}
