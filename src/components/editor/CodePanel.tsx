'use client';
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { getLanguageFromPath } from '@/lib/utils/helpers';
import { Button } from '@/components/ui/button';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { DynamicImport } from '@/components/shared/DynamicImport';

interface CodePanelProps {
  files: Map<string, string>;
  selectedFile: string | null;
  isReadOnly: boolean;
  onToggleReadOnly: () => void;
  onSave: (path: string, content: string) => void;
  scrollToLine?: number | null;
}

export function CodePanel({ files, selectedFile, isReadOnly, onToggleReadOnly, onSave, scrollToLine }: CodePanelProps) {
  const setSelectedFile = useEditorStore((s) => s.setSelectedFile);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, col: 1 });
  const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved' | 'saving'>('saved');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<string>('');
  const editorRef = useRef<any>(null);

  const currentContent = selectedFile ? files.get(selectedFile) || '' : '';
  const language = selectedFile ? getLanguageFromPath(selectedFile) : 'plaintext';

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (selectedFile && value !== undefined && !isReadOnly) {
      contentRef.current = value;
      setSaveStatus('unsaved');

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setSaveStatus('saving');
        onSave(selectedFile, contentRef.current);
        setTimeout(() => setSaveStatus('saved'), 150);
      }, 600);
    }
  }, [selectedFile, isReadOnly, onSave]);

  const pendingDiffs = useEditorStore((s) => s.pendingDiffs);
  const currentFileDiffs = useMemo(() => {
    if (!selectedFile) return null;
    return pendingDiffs.find((d) => d.filename === selectedFile) || null;
  }, [pendingDiffs, selectedFile]);

  const decorationsRef = useRef<string[]>([]);
  const monacoRef = useRef<any>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !currentFileDiffs) {
      if (editor && decorationsRef.current.length > 0) {
        decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
      }
      return;
    }

    const monaco = monacoRef.current;
    if (!monaco) return;

    const oldLines = currentFileDiffs.oldContent.split('\n');
    const newLines = currentFileDiffs.newContent.split('\n');

    const maxLen = Math.max(oldLines.length, newLines.length);
    const decorations: any[] = [];

    for (let i = 0; i < maxLen; i++) {
      const oldLine = oldLines[i] ?? '';
      const newLine = newLines[i] ?? '';
      const lineNumber = i + 1;

      if (oldLine !== newLine && newLine !== '') {
        decorations.push({
          range: new monaco.Range(lineNumber, 1, lineNumber, 1),
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

    return () => {
      if (editorRef.current) {
        decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
      }
    };
  }, [currentFileDiffs, selectedFile, files]);

  const handleEditorMount = (editor: any, monacoInstance: any) => {
    editorRef.current = editor;
    if (monacoInstance) {
      monacoRef.current = monacoInstance;
    }
    editor.onDidChangeCursorPosition((e: any) => {
      setCursorPosition({ line: e.position.lineNumber, col: e.position.column });
    });
  };

  useEffect(() => {
    if (scrollToLine && editorRef.current) {
      editorRef.current.revealLineInCenter(scrollToLine);
      editorRef.current.setPosition({ lineNumber: scrollToLine, column: 1 });
      editorRef.current.focus();
    }
  }, [selectedFile, scrollToLine]);

  if (!selectedFile) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Select a file from the file tree to view its contents
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#0d0d0d] border-b border-dark-border">
        <span className="text-xs text-on-surface-variant font-mono">{selectedFile}</span>
        <div className="flex items-center gap-2">
          {saveStatus === 'unsaved' && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-warning" />
              Unsaved
            </span>
          )}
          {saveStatus === 'saving' && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Saving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Saved
            </span>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={onToggleReadOnly}
            className={`text-xs px-2 py-0.5 h-6 ${isReadOnly ? 'text-on-surface-variant' : 'text-success'}`}
          >
            {isReadOnly ? 'Read Only' : 'Editing'}
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <DynamicImport
          key={selectedFile}
          load={() => import('@monaco-editor/react').then(m => ({ default: m.default }))}
          loading={
            <div className="flex items-center justify-center h-full bg-background">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="text-xs text-muted-foreground">Loading editor...</p>
              </div>
            </div>
          }
          error={(retry) => (
            <div className="flex flex-col items-center justify-center h-full bg-background gap-3">
              <p className="text-xs text-muted-foreground">Failed to load editor</p>
              <button
                onClick={retry}
                className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Retry
              </button>
            </div>
          )}
          props={{
            height: '100%',
            language,
            value: currentContent,
            onChange: handleEditorChange,
            onMount: handleEditorMount,
            options: {
              readOnly: isReadOnly,
              minimap: { enabled: true, scale: 1, showSlider: 'mouseover' as const },
              fontSize: 13,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              tabSize: 2,
              theme: 'vs-dark',
              automaticLayout: true,
              padding: { top: 8 },
              smoothScrolling: true,
              cursorBlinking: 'smooth' as const,
              cursorSmoothCaretAnimation: 'on' as const,
              bracketPairColorization: { enabled: true },
              renderLineHighlight: 'all' as const,
              folding: true,
              foldingHighlight: true,
              guides: { indentation: true, bracketPairs: true },
            },
          }}
        />
      </div>
      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#0d0d0d] border-t border-dark-border text-[11px] text-on-surface-variant">
        <div className="flex items-center gap-3">
          <span>Ln {cursorPosition.line}, Col {cursorPosition.col}</span>
          <span className="w-px h-3 bg-dark-border" />
          <span>UTF-8</span>
          <span className="w-px h-3 bg-dark-border" />
          <span>{language === 'typescript' ? 'TypeScript' : language === 'javascript' ? 'JavaScript' : language === 'css' ? 'CSS' : language === 'html' ? 'HTML' : language}</span>
        </div>
        <div className="flex items-center gap-2">
          {isReadOnly ? (
            <span className="text-warning">Read Only</span>
          ) : (
            <span className="text-success">Editable</span>
          )}
        </div>
      </div>
    </div>
  );
}
