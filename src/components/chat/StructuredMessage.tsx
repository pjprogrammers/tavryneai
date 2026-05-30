'use client';
import { useRef, useEffect, useMemo } from 'react';

// Lazy-load highlight.js
let hljs: any = null;
async function ensureHljs() {
  if (!hljs) {
    const mod = await import('highlight.js/lib/core');
    hljs = mod.default || mod;
    const [js, ts, jsx, tsx, py, css, json, bash, diff, md, xml, wasm] = await Promise.all([
      import('highlight.js/lib/languages/javascript'),
      import('highlight.js/lib/languages/typescript'),
      import('highlight.js/lib/languages/javascript'), // jsx ≈ js
      import('highlight.js/lib/languages/typescript'), // tsx ≈ ts
      import('highlight.js/lib/languages/python'),
      import('highlight.js/lib/languages/css'),
      import('highlight.js/lib/languages/json'),
      import('highlight.js/lib/languages/bash'),
      import('highlight.js/lib/languages/diff'),
      import('highlight.js/lib/languages/markdown'),
      import('highlight.js/lib/languages/xml'),
      import('highlight.js/lib/languages/wasm'),
    ]);
    hljs.registerLanguage('javascript', js.default || js);
    hljs.registerLanguage('typescript', ts.default || ts);
    hljs.registerLanguage('jsx', jsx.default || jsx);
    hljs.registerLanguage('tsx', tsx.default || tsx);
    hljs.registerLanguage('python', py.default || py);
    hljs.registerLanguage('css', css.default || css);
    hljs.registerLanguage('json', json.default || json);
    hljs.registerLanguage('bash', bash.default || bash);
    hljs.registerLanguage('diff', diff.default || diff);
    hljs.registerLanguage('markdown', md.default || md);
    hljs.registerLanguage('xml', xml.default || xml);
    hljs.registerLanguage('html', xml.default || xml);
    hljs.registerLanguage('wasm', wasm.default || wasm);
    hljs.registerLanguage('shell', bash.default || bash);
  }
  return hljs;
}

// ---- Types ----
type ActionType = 'read' | 'edit' | 'create' | 'delete' | 'search';

interface ActionBlock {
  type: 'action';
  action: ActionType;
  path: string;
  code: string;
  language: string;
}

interface CodeBlock {
  type: 'code';
  language: string;
  code: string;
}

interface TextBlock {
  type: 'text';
  content: string;
}

type Segment = TextBlock | CodeBlock | ActionBlock;

// ---- Action icons ----
const ACTION_META: Record<ActionType, { icon: string; label: string; border: string; bg: string; badge: string }> = {
  read:   { icon: '📖', label: 'Read', border: 'border-l-cyan-500', bg: 'bg-cyan-500/5', badge: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400' },
  edit:   { icon: '✏️', label: 'Edit', border: 'border-l-amber-500', bg: 'bg-amber-500/5', badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
  create: { icon: '📝', label: 'Create', border: 'border-l-emerald-500', bg: 'bg-emerald-500/5', badge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
  delete: { icon: '🗑️', label: 'Delete', border: 'border-l-red-500', bg: 'bg-red-500/5', badge: 'bg-red-500/15 text-red-600 dark:text-red-400' },
  search: { icon: '🔎', label: 'Search', border: 'border-l-violet-500', bg: 'bg-violet-500/5', badge: 'bg-violet-500/15 text-violet-600 dark:text-violet-400' },
};

// ---- Parser ----
const ACTION_HEADER = /^##\s*(📖|✏️|📝|🗑️|🔎)\s*(?:Reading|Editing|Creating|Deleting|Searching)\s*:\s*`([^`]+)`\s*$/m;
const CODE_FENCE = /```(\w*)\n?([\s\S]*?)```/g;
const INLINE_CODE = /`[^`]+`/g;

function parseSegments(content: string): Segment[] {
  const segments: Segment[] = [];
  const lines = content.split('\n');

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const actionMatch = line.match(ACTION_HEADER);
    if (actionMatch) {
      const emoji = actionMatch[1];
      const path = actionMatch[2];
      const actionMap: Record<string, ActionType> = { '📖': 'read', '✏️': 'edit', '📝': 'create', '🗑️': 'delete', '🔎': 'search' };
      const action = actionMap[emoji] || 'read';
      i++;

      // Collect code block that follows
      let code = '';
      let language = '';
      if (i < lines.length && lines[i].trimStart().startsWith('```')) {
        const fence = lines[i].match(/```(\w*)/);
        language = fence?.[1] || '';
        i++;
        while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
          code += lines[i] + '\n';
          i++;
        }
        i++; // skip closing fence
        code = code.replace(/\n$/, '');
      } else {
        // Collect text until next action header or code fence
        while (i < lines.length && !lines[i].match(ACTION_HEADER) && !lines[i].trimStart().startsWith('```')) {
          code += lines[i] + '\n';
          i++;
        }
        code = code.replace(/\n$/, '');
      }

      segments.push({ type: 'action', action, path, code, language });
      continue;
    }

    // Non-action line — collect text until action header or code fence
    let text = '';
    while (i < lines.length && !lines[i].match(ACTION_HEADER)) {
      if (lines[i].trimStart().startsWith('```')) {
        break;
      }
      text += lines[i] + '\n';
      i++;
    }
    text = text.replace(/\n$/, '');

    if (text) {
      // Split text into code blocks and text
      const textParts = splitCodeFences(text);
      segments.push(...textParts);
    }
  }

  return segments;
}

function splitCodeFences(text: string): Segment[] {
  const parts: Segment[] = [];
  const regex = /```(\w*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'code', language: match[1] || 'plaintext', code: match[2] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return parts;
}

// ---- Inline Code Renderer ----
function renderInlineCode(text: string) {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((seg, i) => {
    if (seg.startsWith('`') && seg.endsWith('`')) {
      return (
        <code key={i} className="px-1 py-0.5 rounded bg-muted text-[11px] font-mono text-primary">
          {seg.slice(1, -1)}
        </code>
      );
    }
    return <span key={i}>{seg}</span>;
  });
}

// ---- Code Block with Highlighting ----
function HighlightedCode({ code, language }: { code: string; language: string }) {
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (preRef.current && language !== 'plaintext') {
      ensureHljs().then((h) => {
        try {
          const el = preRef.current?.querySelector('code');
          if (el && !el.dataset.highlighted) {
            h.highlightElement(el);
            el.dataset.highlighted = 'true';
          }
        } catch {}
      });
    }
  }, [code, language]);

  return (
    <pre ref={preRef} className="text-xs leading-relaxed p-3 bg-[#0d0d0d] overflow-x-auto rounded-b-lg">
      <code className={`language-${language || 'plaintext'}`}>{code}</code>
    </pre>
  );
}

// ---- Action Card ----
function ActionCard({ action, path, code, language }: ActionBlock) {
  const meta = ACTION_META[action];

  return (
    <div className={`my-2 rounded-lg border border-l-4 ${meta.border} ${meta.bg} border-border/50 overflow-hidden`}>
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border/50 bg-muted/30">
        <span className="text-sm">{meta.icon}</span>
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${meta.badge}`}>
          {meta.label}
        </span>
        <span className="text-xs font-mono text-muted-foreground truncate flex-1">{path}</span>
      </div>
      {code && (
        <HighlightedCode code={code} language={language || path.split('.').pop() || 'plaintext'} />
      )}
    </div>
  );
}

// ---- Text Renderer ----
function TextRenderer({ content }: { content: string }) {
  if (!content) return null;
  return (
    <span className="text-sm leading-relaxed whitespace-pre-wrap">
      {renderInlineCode(content)}
    </span>
  );
}

// ---- Main Component ----
export function StructuredMessage({ content }: { content: string }) {
  const segments = useMemo(() => parseSegments(content), [content]);

  return (
    <div className="space-y-1">
      {segments.map((seg, i) => {
        if (seg.type === 'action') {
          return <ActionCard key={i} {...seg} />;
        }
        if (seg.type === 'code') {
          return (
            <div key={i} className="my-1.5 rounded-lg border border-border/50 overflow-hidden">
              {seg.language && (
                <div className="flex items-center justify-between px-3 py-1 bg-muted/50 border-b border-border/50">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">{seg.language}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(seg.code)}
                    className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Copy
                  </button>
                </div>
              )}
              <HighlightedCode code={seg.code} language={seg.language} />
            </div>
          );
        }
        return <TextRenderer key={i} content={seg.content} />;
      })}
    </div>
  );
}
