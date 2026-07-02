'use client';
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Unlock,
  Check,
  Loader2,
  Circle,
  FileCode2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { getLanguageFromPath } from '@/lib/utils/helpers';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { DynamicImport } from '@/components/shared/DynamicImport';
import { cn } from '@/lib/utils/cn';

interface WorkbenchCodePanelProps {
  files: Map<string, string>;
  selectedFile: string | null;
  isReadOnly: boolean;
  onToggleReadOnly: () => void;
  onSave: (path: string, content: string) => void;
  scrollToLine?: number | null;
  onClose?: () => void;
}

type SaveStatus = 'saved' | 'unsaved' | 'saving';

export function WorkbenchCodePanel({
  files,
  selectedFile,
  isReadOnly,
  onToggleReadOnly,
  onSave,
  scrollToLine,
  onClose,
}: WorkbenchCodePanelProps) {
  const setSelectedFile = useEditorStore((s) => s.setSelectedFile);
  const [cursor, setCursor] = useState({ line: 1, col: 1 });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editorRef = useRef<any>(null);

  const currentContent = selectedFile ? files.get(selectedFile) || '' : '';
  const language = selectedFile ? getLanguageFromPath(selectedFile) : 'plaintext';
  const breadcrumb = useMemo(() => {
    if (!selectedFile) return [];
    return selectedFile.split('/');
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleChange = useCallback(
    (value: string | undefined) => {
      if (selectedFile && value !== undefined && !isReadOnly) {
        setSaveStatus('unsaved');
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          setSaveStatus('saving');
          onSave(selectedFile, value);
          setTimeout(() => setSaveStatus('saved'), 150);
        }, 500);
      }
    },
    [selectedFile, isReadOnly, onSave],
  );

  const pendingDiffs = useEditorStore((s) => s.pendingDiffs);
  const currentDiff = useMemo(
    () => (selectedFile ? pendingDiffs.find((d) => d.filename === selectedFile) : null),
    [pendingDiffs, selectedFile],
  );

  // Inline diff decorations
  const decorationsRef = useRef<string[]>([]);
  const monacoRef = useRef<any>(null);
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (!currentDiff) {
      if (decorationsRef.current.length > 0) {
        decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
      }
      return;
    }
    const monaco = monacoRef.current;
    if (!monaco) return;
    const oldLines = currentDiff.oldContent.split('\n');
    const newLines = currentDiff.newContent.split('\n');
    const maxLen = Math.max(oldLines.length, newLines.length);
    const decorations: any[] = [];
    for (let i = 0; i < maxLen; i++) {
      const oldLine = oldLines[i] ?? '';
      const newLine = newLines[i] ?? '';
      if (oldLine !== newLine && newLine !== '') {
        decorations.push({
          range: new monaco.Range(i + 1, 1, i + 1, 1),
          options: {
            isWholeLine: true,
            linesDecorationsClassName: 'monaco-diff-added-gutter',
            className: 'monaco-diff-added-line',
            glyphMarginClassName: 'monaco-diff-added-glyph',
          },
        });
      }
    }
    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, decorations);
  }, [currentDiff]);

  const handleMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    if (monaco) monacoRef.current = monaco;
    editor.onDidChangeCursorPosition((e: any) =>
      setCursor({ line: e.position.lineNumber, col: e.position.column }),
    );
  };

  useEffect(() => {
    if (scrollToLine && editorRef.current) {
      editorRef.current.revealLineInCenter(scrollToLine);
      editorRef.current.setPosition({ lineNumber: scrollToLine, column: 1 });
      editorRef.current.focus();
    }
  }, [selectedFile, scrollToLine]);

  if (!selectedFile) {
    return <EmptyCodeState onClose={onClose} />;
  }

  return (
    <div className="flex flex-col h-full min-h-0 relative">
      {/* Header — 3D breadcrumb + status */}
      <div className="px-3 sm:px-4 h-12 border-b border-border/40 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden">
          <FileCode2 className="h-3.5 w-3.5 text-primary shrink-0" />
          {breadcrumb.map((part, i) => (
            <div key={i} className="flex items-center gap-1 min-w-0">
              {i > 0 && (
                <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
              )}
              <button
                onClick={() => {
                  if (i < breadcrumb.length - 1) {
                    setSelectedFile(breadcrumb.slice(0, i + 1).join('/'));
                  }
                }}
                className={cn(
                  'text-[12px] truncate font-mono wb-press',
                  i === breadcrumb.length - 1
                    ? 'text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {part}
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <SaveIndicator status={saveStatus} />
          <button
            onClick={onToggleReadOnly}
            className={cn(
              'h-7 px-2 rounded-lg flex items-center gap-1.5 text-[10px] font-medium wb-press transition-colors',
              isReadOnly
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                : 'bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/30',
            )}
          >
            {isReadOnly ? (
              <Lock className="h-3 w-3" />
            ) : (
              <Unlock className="h-3 w-3" />
            )}
            <span className="hidden sm:inline">
              {isReadOnly ? 'Read' : 'Edit'}
            </span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 wb-press"
              aria-label="Close code"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <DynamicImport
          key={selectedFile}
          load={() =>
            import('@monaco-editor/react').then((m) => ({ default: m.default }))
          }
          loading={<EditorLoading />}
          error={(retry) => (
            <div className="flex flex-col items-center justify-center h-full bg-background gap-3">
              <p className="text-xs text-muted-foreground">Failed to load editor</p>
              <button
                onClick={retry}
                className="px-3 py-1.5 text-xs gradient-primary text-white rounded-lg"
              >
                Retry
              </button>
            </div>
          )}
          props={{
            height: '100%',
            language,
            value: currentContent,
            onChange: handleChange,
            onMount: handleMount,
            options: {
              readOnly: isReadOnly,
              minimap: {
                enabled: true,
                scale: 1,
                showSlider: 'mouseover' as const,
                renderCharacters: false,
              },
              fontSize: 13,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              tabSize: 2,
              theme: 'vs-dark',
              automaticLayout: true,
              padding: { top: 12, bottom: 12 },
              smoothScrolling: true,
              cursorBlinking: 'smooth' as const,
              cursorSmoothCaretAnimation: 'on' as const,
              bracketPairColorization: { enabled: true },
              renderLineHighlight: 'all' as const,
              folding: true,
              foldingHighlight: true,
              guides: { indentation: true, bracketPairs: true },
              scrollbar: {
                vertical: 'auto',
                horizontal: 'auto',
                useShadows: false,
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
              },
            },
          }}
        />
      </div>

      {/* Status bar */}
      <div className="h-7 px-3 sm:px-4 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground shrink-0">
        <div className="flex items-center gap-3">
          <span className="tabular-nums">
            Ln {cursor.line}, Col {cursor.col}
          </span>
          <span className="hidden sm:inline">UTF-8</span>
          <span className="hidden sm:inline uppercase">{language}</span>
        </div>
        <div className="flex items-center gap-2">
          {currentDiff && (
            <span className="text-amber-500 flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5" />
              AI changes
            </span>
          )}
          <span>{isReadOnly ? 'Read Only' : 'Editable'}</span>
        </div>
      </div>
    </div>
  );
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  const config = {
    saved: { icon: <Check className="h-3 w-3" />, color: 'text-green-500', label: 'Saved' },
    unsaved: {
      icon: <Circle className="h-3 w-3 fill-current" />,
      color: 'text-amber-500',
      label: 'Unsaved',
    },
    saving: {
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
      color: 'text-primary',
      label: 'Saving',
    },
  } as const;
  const c = config[status];
  return (
    <div
      className={cn(
        'hidden sm:flex items-center gap-1 text-[10px] font-medium',
        c.color,
      )}
    >
      {c.icon}
      <span>{c.label}</span>
    </div>
  );
}

function EditorLoading() {
  return (
    <div className="flex items-center justify-center h-full bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-full border-2 border-primary/30" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
        </div>
        <p className="text-xs text-muted-foreground">Loading editor…</p>
      </div>
    </div>
  );
}

function EmptyCodeState({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-3 h-12 border-b border-border/40 flex items-center justify-between">
        <span className="text-[12px] font-semibold text-muted-foreground">Code</span>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            aria-label="Close"
          >
            ×
          </button>
        )}
      </div>
      <div className="flex-1 flex items-center justify-center px-6 text-center">
        <div>
          <div
            className="h-16 w-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-4"
            style={{ transform: 'perspective(400px) rotateX(8deg) rotateY(-8deg)' }}
          >
            <FileCode2 className="h-7 w-7 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1">No file open</h3>
          <p className="text-[11px] text-muted-foreground max-w-[240px] mx-auto">
            Pick a file from the Files tab to view and edit its code
          </p>
        </div>
      </div>
    </div>
  );
}
