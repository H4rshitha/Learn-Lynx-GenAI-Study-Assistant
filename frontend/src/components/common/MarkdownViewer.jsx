import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, Terminal, ExternalLink } from 'lucide-react';
import { cn } from '../../utils/cn';

export const MarkdownViewer = ({ content, className }) => {
  return (
    <div className={cn('prose-dark max-w-none text-sm leading-relaxed space-y-2', className)}>
      <ReactMarkdown
        components={{
          code({ node, inline, className: codeClassName, children, ...props }) {
            const match = /language-(\w+)/.exec(codeClassName || '');
            const codeString = String(children).replace(/\n$/, '');

            if (!inline) {
              return <CodeBlock language={match ? match[1] : 'text'} code={codeString} />;
            }
            return (
              <code className="bg-slate-900/90 text-brand-300 px-1.5 py-0.5 rounded-md text-xs font-mono border border-slate-700/50" {...props}>
                {children}
              </code>
            );
          },
          blockquote({ children }) {
            return (
              <div className="border-l-4 border-brand-500 bg-brand-500/10 px-4 py-3 rounded-r-2xl my-3 text-slate-200 shadow-sm">
                {children}
              </div>
            );
          },
          table({ children }) {
            return (
              <div className="my-4 overflow-x-auto rounded-xl border border-slate-700/80 bg-slate-950/70 shadow-lg">
                <table className="w-full text-left text-xs text-slate-300 border-collapse divide-y divide-slate-800">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-slate-900/90 font-mono text-[11px] uppercase tracking-wider text-slate-400 font-semibold">{children}</thead>;
          },
          tbody({ children }) {
            return <tbody className="divide-y divide-slate-800/80">{children}</tbody>;
          },
          tr({ children }) {
            return <tr className="hover:bg-slate-900/50 transition-colors">{children}</tr>;
          },
          th({ children }) {
            return <th className="px-4 py-3 font-semibold text-brand-300">{children}</th>;
          },
          td({ children }) {
            return <td className="px-4 py-3 text-slate-200">{children}</td>;
          },
          h1: ({ children }) => <h1 className="text-xl font-bold text-white mt-4 mb-2 font-display">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-bold text-indigo-300 mt-3 mb-2 font-display">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-semibold text-cyan-300 mt-3 mb-1.5">{children}</h3>,
          h4: ({ children }) => <h4 className="text-sm font-semibold text-purple-300 mt-2 mb-1">{children}</h4>,
          ul: ({ children }) => <ul className="list-disc pl-5 my-2.5 space-y-1.5 text-slate-200">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 my-2.5 space-y-1.5 text-slate-200">{children}</ol>,
          p: ({ children }) => <p className="my-2 text-slate-200 leading-relaxed">{children}</p>,
          hr: () => <hr className="my-4 border-t border-white/10" />,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 hover:text-brand-300 underline underline-offset-4 inline-flex items-center gap-1 font-medium"
            >
              <span>{children}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          ),
          strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
          em: ({ children }) => <em className="text-slate-300 italic">{children}</em>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

const CodeBlock = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-2xl overflow-hidden border border-slate-700/80 bg-[#0B0F17] shadow-xl">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-brand-400" />
          <span className="uppercase text-brand-400 font-semibold">{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="text-[11px] font-medium">{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-xs font-mono leading-relaxed text-slate-200">
        <pre className="selection:bg-brand-500/30">{code}</pre>
      </div>
    </div>
  );
};

