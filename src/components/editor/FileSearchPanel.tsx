'use client';
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';

interface FileSearchPanelProps {
  files: Map<string, string>;
  onSelectFile: (path: string, line?: number) => void;
  onClose: () => void;
}

interface SearchMatch {
  path: string;
  lineNumber: number;
  lineContent: string;
  matchStart: number;
  matchEnd: number;
}

export function FileSearchPanel({ files, onSelectFile, onClose }: FileSearchPanelProps) {
  const [query, setQuery] = useState('');
  const [isRegex, setIsRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const [selectedMatch, setSelectedMatch] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const matches = useMemo(() => {
    if (!query.trim()) return [];
    const results: SearchMatch[] = [];
    let searchRegex: RegExp | null = null;

    try {
      if (isRegex) {
        searchRegex = new RegExp(query, caseSensitive ? 'g' : 'gi');
      }
    } catch {
      return [];
    }

    for (const [path, content] of files) {
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (isRegex && searchRegex) {
          searchRegex.lastIndex = 0;
          const m = searchRegex.exec(line);
          if (m) {
            results.push({
              path,
              lineNumber: i + 1,
              lineContent: line,
              matchStart: m.index,
              matchEnd: m.index + m[0].length,
            });
          }
        } else {
          const idx = caseSensitive
            ? line.indexOf(query)
            : line.toLowerCase().indexOf(query.toLowerCase());
          if (idx !== -1) {
            results.push({
              path,
              lineNumber: i + 1,
              lineContent: line,
              matchStart: idx,
              matchEnd: idx + query.length,
            });
          }
        }
      }
    }
    return results;
  }, [query, files, isRegex, caseSensitive]);

  const groupedMatches = useMemo(() => {
    const groups = new Map<string, SearchMatch[]>();
    for (const m of matches) {
      const list = groups.get(m.path) || [];
      list.push(m);
      groups.set(m.path, list);
    }
    return groups;
  }, [matches]);

  const totalMatches = matches.length;
  const totalFiles = groupedMatches.size;

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    setSelectedMatch(0);
    // Auto-expand all files when results change
    if (matches.length > 0) {
      setExpandedFiles(new Set(groupedMatches.keys()));
    }
  }, [query, isRegex, caseSensitive]);

  const goToMatch = useCallback((match: SearchMatch) => {
    onSelectFile(match.path, match.lineNumber);
  }, [onSelectFile]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  const toggleFile = useCallback((path: string) => {
    setExpandedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  return (
    <div className="flex flex-col h-full border-b border-border bg-card">
      <div className="flex items-center gap-2 p-2 border-b border-border">
        <svg className="h-3.5 w-3.5 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search across files..."
          className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <button
          onClick={() => setIsRegex(!isRegex)}
          className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
            isRegex ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
          title="Use regex"
        >
          .*
        </button>
        <button
          onClick={() => setCaseSensitive(!caseSensitive)}
          className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
            caseSensitive ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
          title="Case sensitive"
        >
          Aa
        </button>
        <button
          onClick={onClose}
          className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {query.trim() && (
        <div className="px-3 py-1.5 text-[10px] text-muted-foreground border-b border-border/50">
          {totalMatches > 0
            ? `${totalMatches} results in ${totalFiles} file${totalFiles !== 1 ? 's' : ''}`
            : 'No results found'}
        </div>
      )}

      <div className="flex-1 overflow-y-auto text-xs">
        {query.trim() && totalMatches > 0 && (
          <div className="py-1">
            {Array.from(groupedMatches.entries()).map(([path, fileMatches]) => (
              <div key={path}>
                <button
                  onClick={() => toggleFile(path)}
                  className="flex items-center gap-1.5 w-full px-3 py-1.5 text-left hover:bg-secondary/50 transition-colors"
                >
                  <svg
                    className={`h-2.5 w-2.5 text-muted-foreground transition-transform ${expandedFiles.has(path) ? 'rotate-90' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-[11px] font-medium text-foreground truncate flex-1">{path}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">{fileMatches.length}</span>
                </button>
                {expandedFiles.has(path) && (
                  <div>
                    {fileMatches.map((match, mi) => (
                      <button
                        key={`${match.path}-${match.lineNumber}-${match.matchStart}`}
                        onClick={() => goToMatch(match)}
                        className="flex items-start gap-2 w-full px-3 py-1 pl-8 text-left hover:bg-primary/5 transition-colors"
                      >
                        <span className="text-[10px] text-muted-foreground font-mono w-8 shrink-0 text-right">
                          {match.lineNumber}
                        </span>
                        <span className="text-[11px] font-mono text-foreground truncate leading-relaxed">
                          <span className="text-muted-foreground">{match.lineContent.slice(0, Math.max(0, match.matchStart))}</span>
                          <span className="bg-primary/30 text-primary rounded-sm">{match.lineContent.slice(match.matchStart, match.matchEnd)}</span>
                          <span className="text-muted-foreground">{match.lineContent.slice(match.matchEnd)}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {query.trim() === '' && (
          <div className="flex items-center justify-center h-full text-[11px] text-muted-foreground">
            Type to search across all project files
          </div>
        )}
      </div>
    </div>
  );
}
