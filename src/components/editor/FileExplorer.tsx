'use client';
import { useState, useMemo } from 'react';
import { FileTree } from './FileTree';
import { usePanelStore, PREVIEW_DEVICE_SIZES } from '@/lib/store/usePanelStore';
import { Search, Clock, History, FileCode } from 'lucide-react';

interface FileExplorerProps {
  files: Map<string, string>;
  onSelect: (path: string | null) => void;
  selectedFile: string | null;
  onDownloadFile?: (path: string) => void;
  onDownloadAll?: () => void;
  onAddFile?: (path: string) => void;
  onRenameFile?: (oldPath: string, newPath: string) => void;
  onDeleteFile?: (path: string) => void;
  onClose?: () => void;
}

export function FileExplorer({ files, onSelect, selectedFile, onDownloadFile, onDownloadAll, onAddFile, onRenameFile, onDeleteFile, onClose }: FileExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showRecent, setShowRecent] = useState(false);
  const { recentFiles } = usePanelStore();

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files;
    const query = searchQuery.toLowerCase();
    const filtered = new Map<string, string>();
    for (const [path, content] of files) {
      if (path.toLowerCase().includes(query)) {
        filtered.set(path, content);
      }
    }
    return filtered;
  }, [files, searchQuery]);

  const aiModifiedFiles = useMemo(() => {
    return Array.from(files.keys()).filter((p) => p.startsWith('src/')).slice(0, 3);
  }, [files]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-3 h-9 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-1.5">
          <FileCode className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Files</span>
          <span className="text-[10px] text-muted-foreground bg-secondary/50 px-1 rounded">{files.size}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setShowRecent(!showRecent)}
            className={`h-5 w-5 rounded flex items-center justify-center transition-colors ${
              showRecent ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Recent files"
          >
            <Clock className="h-3 w-3" />
          </button>
          {onClose && (
            <button onClick={onClose} className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="px-2 pt-1.5 pb-0.5">
        <div className="flex items-center gap-1.5 bg-secondary/30 rounded-md px-2 py-1 border border-border/50">
          <Search className="h-3 w-3 text-muted-foreground shrink-0" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/50 outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="h-4 w-4 rounded flex items-center justify-center text-muted-foreground hover:text-foreground">
              <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {aiModifiedFiles.length > 0 && !showRecent && !searchQuery && (
        <div className="px-2 pt-1 pb-0.5">
          <div className="text-[10px] text-primary font-medium px-1 mb-0.5">Recently Modified</div>
          <div className="space-y-0.5">
            {aiModifiedFiles.map((path) => (
              <button
                key={path}
                onClick={() => onSelect(path)}
                className={`w-full text-left flex items-center gap-1.5 px-1.5 py-1 rounded text-[11px] transition-colors ${
                  selectedFile === path ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                <History className="h-2.5 w-2.5 shrink-0" />
                <span className="truncate">{path}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {showRecent && (
        <div className="px-2 pt-1 pb-0.5">
          <div className="text-[10px] text-muted-foreground font-medium px-1 mb-0.5">Recent Files</div>
          {recentFiles.length === 0 ? (
            <p className="text-[10px] text-muted-foreground/50 px-1">No recent files</p>
          ) : (
            <div className="space-y-0.5">
              {recentFiles.map((path) => (
                <button
                  key={path}
                  onClick={() => { onSelect(path); setShowRecent(false); }}
                  className={`w-full text-left flex items-center gap-1.5 px-1.5 py-1 rounded text-[11px] transition-colors ${
                    selectedFile === path ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  <FileCode className="h-2.5 w-2.5 shrink-0" />
                  <span className="truncate">{path}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {!showRecent && (
        <div className="flex-1 overflow-y-auto">
          <FileTree
            files={filteredFiles}
            onSelect={onSelect}
            selectedFile={selectedFile}
            onDownloadFile={onDownloadFile}
            onDownloadAll={onDownloadAll}
            onAddFile={onAddFile}
            onRenameFile={onRenameFile}
            onDeleteFile={onDeleteFile}
          />
        </div>
      )}
    </div>
  );
}
