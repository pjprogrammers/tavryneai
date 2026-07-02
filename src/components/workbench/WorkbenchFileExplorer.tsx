'use client';
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  FolderTree,
  FileCode2,
  Folder,
  FolderOpen,
  Plus,
  Download,
  Clock,
  History,
  ChevronRight,
  MoreHorizontal,
  Trash2,
  Edit3,
} from 'lucide-react';
import { usePanelStore } from '@/lib/store/usePanelStore';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { cn } from '@/lib/utils/cn';

interface WorkbenchFileExplorerProps {
  files: Map<string, string>;
  onSelect: (path: string | null) => void;
  selectedFile: string | null;
  onDownloadFile?: (path: string) => void;
  onDownloadAll?: () => void;
  onAddFile?: (path: string) => void;
  onRenameFile?: (oldPath: string, newPath: string) => void;
  onDeleteFile?: (path: string) => void;
  onClose?: () => void;
  variant?: 'panel' | 'sheet';
}

const EXT_COLORS: Record<string, string> = {
  tsx: 'text-blue-400',
  ts: 'text-blue-300',
  jsx: 'text-yellow-400',
  js: 'text-yellow-300',
  css: 'text-pink-400',
  json: 'text-green-400',
  md: 'text-gray-400',
  html: 'text-orange-400',
  py: 'text-emerald-400',
  vue: 'text-emerald-500',
};

interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children: TreeNode[];
}

function buildTree(files: Map<string, string>): TreeNode[] {
  const root: TreeNode[] = [];
  for (const filePath of files.keys()) {
    const parts = filePath.split('/');
    let level = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      const existing = level.find((n) => n.name === part);
      if (existing) {
        level = existing.children;
      } else {
        const node: TreeNode = {
          name: part,
          path: parts.slice(0, i + 1).join('/'),
          type: isFile ? 'file' : 'directory',
          children: [],
        };
        level.push(node);
        level = node.children;
      }
    }
  }
  return root;
}

export function WorkbenchFileExplorer({
  files,
  onSelect,
  selectedFile,
  onDownloadFile,
  onDownloadAll,
  onAddFile,
  onRenameFile,
  onDeleteFile,
  onClose,
  variant = 'panel',
}: WorkbenchFileExplorerProps) {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'tree' | 'recent'>('tree');
  const [creating, setCreating] = useState(false);
  const [newPath, setNewPath] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const recentFiles = usePanelStore((s) => s.recentFiles);
  const addRecentFile = usePanelStore((s) => s.addRecentFile);

  // Auto-expand directories on first render
  useEffect(() => {
    const dirs = new Set<string>();
    for (const p of files.keys()) {
      const parts = p.split('/');
      for (let i = 1; i < parts.length; i++) {
        dirs.add(parts.slice(0, i).join('/'));
      }
    }
    setExpanded((prev) => {
      if (prev.size > 0) return prev;
      const next = new Set<string>(dirs);
      next.add('src');
      return next;
    });
  }, [files]);

  const filtered = useMemo(() => {
    if (!search.trim()) return files;
    const q = search.toLowerCase();
    const m = new Map<string, string>();
    for (const [p, c] of files) {
      if (p.toLowerCase().includes(q)) m.set(p, c);
    }
    return m;
  }, [files, search]);

  const tree = useMemo(() => buildTree(filtered), [filtered]);

  const handleCreate = useCallback(() => {
    const p = newPath.trim();
    if (p && onAddFile) {
      const clean = p.startsWith('/') ? p.slice(1) : p;
      onAddFile(clean);
      onSelect(clean);
      addRecentFile(clean);
    }
    setCreating(false);
    setNewPath('');
  }, [newPath, onAddFile, onSelect, addRecentFile]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between gap-2 px-3 sm:px-4 border-b border-border/40',
          variant === 'sheet' ? 'h-12' : 'h-12',
        )}
      >
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center">
            <FolderTree className="h-3 w-3 text-blue-400" />
          </div>
          <span className="text-[12px] font-semibold text-foreground">Files</span>
          <span className="text-[10px] text-muted-foreground bg-secondary/60 px-1.5 rounded-full">
            {files.size}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setView(view === 'tree' ? 'recent' : 'tree')}
            className={cn(
              'h-7 w-7 rounded-md flex items-center justify-center wb-press',
              view === 'recent'
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60',
            )}
            title="Recent files"
          >
            <Clock className="h-3.5 w-3.5" />
          </button>
          {onDownloadAll && files.size > 0 && (
            <button
              onClick={onDownloadAll}
              className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 wb-press"
              title="Download ZIP"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          )}
          {onAddFile && (
            <button
              onClick={() => setCreating(true)}
              className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 wb-press"
              title="New file"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 wb-press md:hidden"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pt-2.5 pb-1.5">
        <div className="flex items-center gap-2 bg-secondary/40 border border-border/40 rounded-xl px-2.5 h-9 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
          <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files…"
            className="flex-1 bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground/60 outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="h-5 w-5 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* New file input */}
      <AnimatePresence>
        {creating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-3 pb-2"
          >
            <div className="flex items-center gap-1.5 bg-secondary/60 rounded-lg px-2 h-8 border border-primary/40">
              <FileCode2 className="h-3.5 w-3.5 text-primary shrink-0" />
              <input
                autoFocus
                value={newPath}
                onChange={(e) => setNewPath(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                  if (e.key === 'Escape') {
                    setCreating(false);
                    setNewPath('');
                  }
                }}
                onBlur={handleCreate}
                placeholder="src/Component.tsx"
                className="flex-1 bg-transparent text-[12px] outline-none"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-1.5 pb-2">
        {view === 'recent' ? (
          <RecentList
            paths={recentFiles}
            onSelect={(p) => {
              onSelect(p);
              onClose?.();
            }}
            selectedFile={selectedFile}
          />
        ) : tree.length === 0 ? (
          <div className="text-center py-8 px-4">
            <div className="h-12 w-12 mx-auto rounded-2xl bg-secondary/40 flex items-center justify-center mb-3">
              <FolderTree className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-[12px] font-medium text-foreground">No files yet</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Ask the AI to create something
            </p>
          </div>
        ) : (
          tree.map((node) => (
            <TreeNodeView
              key={node.path}
              node={node}
              depth={0}
              expanded={expanded}
              setExpanded={setExpanded}
              onSelect={(p) => {
                onSelect(p);
                addRecentFile(p);
                onClose?.();
              }}
              selectedFile={selectedFile}
              onRename={onRenameFile}
              onDelete={onDeleteFile}
              onDownload={onDownloadFile}
            />
          ))
        )}
      </div>
    </div>
  );
}

function RecentList({
  paths,
  onSelect,
  selectedFile,
}: {
  paths: string[];
  onSelect: (p: string) => void;
  selectedFile: string | null;
}) {
  if (paths.length === 0) {
    return (
      <div className="text-center py-8 px-4 text-[11px] text-muted-foreground">
        <History className="h-6 w-6 mx-auto mb-2 opacity-50" />
        No recent files yet
      </div>
    );
  }
  return (
    <div className="space-y-0.5 pt-1">
      {paths.map((p) => (
        <button
          key={p}
          onClick={() => onSelect(p)}
          className={cn(
            'w-full text-left flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] wb-press transition-colors',
            selectedFile === p
              ? 'bg-primary/15 text-primary'
              : 'text-foreground/90 hover:bg-secondary/60',
          )}
        >
          <FileCode2
            className={cn(
              'h-3.5 w-3.5 shrink-0',
              EXT_COLORS[p.split('.').pop() || ''] || 'text-muted-foreground',
            )}
          />
          <span className="truncate flex-1 font-mono text-[11px]">{p}</span>
        </button>
      ))}
    </div>
  );
}

function TreeNodeView({
  node,
  depth,
  expanded,
  setExpanded,
  onSelect,
  selectedFile,
  onRename,
  onDelete,
  onDownload,
}: {
  node: TreeNode;
  depth: number;
  expanded: Set<string>;
  setExpanded: React.Dispatch<React.SetStateAction<Set<string>>>;
  onSelect: (p: string) => void;
  selectedFile: string | null;
  onRename?: (o: string, n: string) => void;
  onDelete?: (p: string) => void;
  onDownload?: (p: string) => void;
}) {
  const isOpen = expanded.has(node.path);
  const isSelected = node.path === selectedFile;
  const [renaming, setRenaming] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [newName, setNewName] = useState(node.name);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [renaming]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }
  }, [menuOpen]);

  if (node.type === 'directory') {
    return (
      <div>
        <button
          onClick={() => {
            const next = new Set(expanded);
            if (isOpen) next.delete(node.path);
            else next.add(node.path);
            setExpanded(next);
          }}
          className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[12px] font-medium text-foreground/90 hover:bg-secondary/40 wb-press"
          style={{ paddingLeft: `${8 + depth * 14}px` }}
        >
          <ChevronRight
            className={cn(
              'h-3 w-3 text-muted-foreground transition-transform',
              isOpen && 'rotate-90',
            )}
          />
          {isOpen ? (
            <FolderOpen className="h-3.5 w-3.5 text-amber-500" />
          ) : (
            <Folder className="h-3.5 w-3.5 text-amber-500" />
          )}
          <span className="truncate">{node.name}</span>
          <span className="text-[10px] text-muted-foreground/60 ml-auto">
            {node.children.length}
          </span>
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
            >
              {node.children.map((c) => (
                <TreeNodeView
                  key={c.path}
                  node={c}
                  depth={depth + 1}
                  expanded={expanded}
                  setExpanded={setExpanded}
                  onSelect={onSelect}
                  selectedFile={selectedFile}
                  onRename={onRename}
                  onDelete={onDelete}
                  onDownload={onDownload}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const ext = node.name.split('.').pop()?.toLowerCase() || '';
  const extColor = EXT_COLORS[ext] || 'text-muted-foreground';

  return (
    <div className="relative">
      <div
        onClick={() => {
          if (!renaming) onSelect(node.path);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          setMenuOpen(true);
        }}
        className={cn(
          'group flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer text-[12px] wb-press transition-colors',
          isSelected
            ? 'bg-primary/15 text-primary'
            : 'text-foreground/85 hover:bg-secondary/50',
        )}
        style={{ paddingLeft: `${24 + depth * 14}px` }}
      >
        <FileCode2 className={cn('h-3.5 w-3.5 shrink-0', extColor)} />
        {renaming ? (
          <input
            ref={inputRef}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={() => {
              if (
                newName.trim() &&
                newName !== node.name &&
                onRename
              ) {
                const parent = node.path.includes('/')
                  ? node.path.substring(0, node.path.lastIndexOf('/') + 1)
                  : '';
                onRename(node.path, parent + newName.trim());
              }
              setRenaming(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
              if (e.key === 'Escape') {
                setRenaming(false);
                setNewName(node.name);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 bg-secondary/60 text-foreground text-[12px] px-1 py-0.5 rounded border border-primary/50 outline-none min-w-0 font-mono"
          />
        ) : (
          <span className="flex-1 truncate font-mono text-[11px]">{node.name}</span>
        )}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((o) => !o);
            }}
            className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary"
            aria-label="More"
          >
            <MoreHorizontal className="h-3 w-3" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            className="absolute right-2 top-full mt-1 z-30 wb-glass-strong rounded-xl p-1 min-w-[140px]"
            onClick={(e) => e.stopPropagation()}
          >
            {onRename && (
              <MenuItem
                icon={<Edit3 className="h-3 w-3" />}
                label="Rename"
                onClick={() => {
                  setMenuOpen(false);
                  setRenaming(true);
                }}
              />
            )}
            {onDownload && (
              <MenuItem
                icon={<Download className="h-3 w-3" />}
                label="Download"
                onClick={() => {
                  setMenuOpen(false);
                  onDownload(node.path);
                }}
              />
            )}
            {onDelete && (
              <MenuItem
                icon={<Trash2 className="h-3 w-3" />}
                label="Delete"
                danger
                onClick={() => {
                  setMenuOpen(false);
                  if (window.confirm(`Delete "${node.path}"?`)) {
                    onDelete(node.path);
                  }
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[12px] wb-press transition-colors',
        danger
          ? 'text-red-500 hover:bg-red-500/10'
          : 'text-foreground/90 hover:bg-secondary/60',
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
