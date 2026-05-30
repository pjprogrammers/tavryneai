'use client';
import { useCallback, useState, useRef, useEffect } from 'react';

interface FileTreeProps {
  files: Map<string, string>;
  onSelect: (path: string | null) => void;
  selectedFile: string | null;
  onDownloadFile?: (path: string) => void;
  onDownloadAll?: () => void;
  onAddFile?: (path: string) => void;
  onRenameFile?: (oldPath: string, newPath: string) => void;
  onDeleteFile?: (path: string) => void;
}

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
    let currentLevel = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;

      const existing = currentLevel.find((n) => n.name === part);
      if (existing) {
        currentLevel = existing.children;
      } else {
        const newNode: TreeNode = {
          name: part,
          path: parts.slice(0, i + 1).join('/'),
          type: isFile ? 'file' : 'directory',
          children: [],
        };
        currentLevel.push(newNode);
        currentLevel = newNode.children;
      }
    }
  }

  return root;
}

function FileIcon({ name }: { name: string }) {
  const ext = name.split('.').pop()?.toLowerCase();
  const colors: Record<string, string> = {
    tsx: 'text-blue-400',
    ts: 'text-blue-300',
    jsx: 'text-yellow-400',
    js: 'text-yellow-300',
    css: 'text-pink-400',
    json: 'text-green-400',
    md: 'text-gray-400',
    html: 'text-orange-400',
  };
  return <span className={`material-symbols-outlined text-sm ${colors[ext || ''] || 'text-on-surface-variant'}`}>description</span>;
}

function FolderIcon() {
  return <span className="material-symbols-outlined text-sm text-amber-500">folder</span>;
}

interface FileTreeNodeProps {
  node: TreeNode;
  depth: number;
  onSelect: (path: string | null) => void;
  selectedFile: string | null;
  onDownloadFile?: (path: string) => void;
  onRenameFile?: (oldPath: string, newPath: string) => void;
  onDeleteFile?: (path: string) => void;
}

function FileTreeNode({
  node,
  depth,
  onSelect,
  selectedFile,
  onDownloadFile,
  onRenameFile,
  onDeleteFile,
}: FileTreeNodeProps) {
  const isSelected = node.path === selectedFile;
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(node.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (renaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [renaming]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [menuOpen]);

  const handleDownload = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDownloadFile?.(node.path);
  }, [node.path, onDownloadFile]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(true);
  }, []);

  const handleRenameSubmit = useCallback(() => {
    const trimmed = newName.trim();
    if (trimmed && trimmed !== node.name && onRenameFile) {
      const parentPath = node.path.includes('/')
        ? node.path.substring(0, node.path.lastIndexOf('/') + 1)
        : '';
      onRenameFile(node.path, parentPath + trimmed);
    }
    setRenaming(false);
    setNewName(node.name);
  }, [newName, node.name, node.path, onRenameFile]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (onDeleteFile && window.confirm(`Delete "${node.path}"?`)) {
      onDeleteFile(node.path);
    }
  }, [node.path, onDeleteFile]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      setRenaming(false);
      setNewName(node.name);
    }
  }, [handleRenameSubmit, node.name]);

  if (node.type === 'file') {
    return (
      <>
        <div
          onClick={() => {
            if (!renaming) onSelect(node.path);
          }}
          onContextMenu={handleContextMenu}
          className={`group flex items-center gap-2 px-2 py-1 cursor-pointer text-xs rounded transition-colors ${
            isSelected
              ? 'bg-primary/20 text-primary'
              : 'text-on-surface-variant hover:text-foreground hover:bg-dark-border/30'
          }`}
          style={{ paddingLeft: `${12 + depth * 12}px` }}
        >
          <FileIcon name={node.name} />
          {renaming ? (
            <input
              ref={inputRef}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 bg-secondary/50 text-foreground text-xs px-1 py-0.5 rounded border border-primary/50 outline-none min-w-0"
            />
          ) : (
            <span className="flex-1 truncate">{node.name}</span>
          )}
          {onDownloadFile && !renaming && (
            <button
              onClick={handleDownload}
              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-foreground/10 transition-all shrink-0"
              title={`Download ${node.name}`}
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          )}
        </div>

        {menuOpen && (
          <div
            ref={menuRef}
            className="fixed z-50 bg-card border border-border rounded-lg shadow-xl py-1 text-xs"
            style={{
              left: '200px',
              top: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => { setMenuOpen(false); setRenaming(true); }}
              className="w-full text-left px-3 py-1.5 text-foreground hover:bg-secondary transition-colors"
            >
              Rename
            </button>
            <button
              onClick={handleDelete}
              className="w-full text-left px-3 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <div>
      <div
        className="flex items-center gap-2 px-2 py-1 text-xs text-on-surface-variant font-medium"
        style={{ paddingLeft: `${12 + depth * 12}px` }}
      >
        <FolderIcon />
        {node.name}
      </div>
      {node.children.map((child) => (
        <FileTreeNode
          key={child.path}
          node={child}
          depth={depth + 1}
          onSelect={onSelect}
          selectedFile={selectedFile}
          onDownloadFile={onDownloadFile}
          onRenameFile={onRenameFile}
          onDeleteFile={onDeleteFile}
        />
      ))}
    </div>
  );
}

export function FileTree({ files, onSelect, selectedFile, onDownloadFile, onDownloadAll, onAddFile, onRenameFile, onDeleteFile }: FileTreeProps) {
  const tree = buildTree(files);
  const [creating, setCreating] = useState(false);
  const [newFilePath, setNewFilePath] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (creating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [creating]);

  const handleCreateFile = useCallback(() => {
    const trimmed = newFilePath.trim();
    if (trimmed && onAddFile) {
      const fullPath = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
      onAddFile(fullPath);
      onSelect(fullPath);
    }
    setCreating(false);
    setNewFilePath('');
  }, [newFilePath, onAddFile, onSelect]);

  const handleCreateKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateFile();
    } else if (e.key === 'Escape') {
      setCreating(false);
      setNewFilePath('');
    }
  }, [handleCreateFile]);

  return (
    <div className="py-2">
      <div className="flex items-center justify-between px-3 pb-2">
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
            Files
          </span>
          {onAddFile && !creating && (
            <button
              onClick={() => setCreating(true)}
              className="h-4 w-4 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title="New file"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
        </div>
        {onDownloadAll && files.size > 0 && (
          <button
            onClick={onDownloadAll}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded hover:bg-foreground/10 transition-colors"
            title="Download all as ZIP"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            ZIP
          </button>
        )}
      </div>

      {creating && (
        <div className="flex items-center gap-1 px-3 pb-1">
          <svg className="h-3 w-3 text-on-surface-variant shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <input
            ref={inputRef}
            value={newFilePath}
            onChange={(e) => setNewFilePath(e.target.value)}
            onBlur={handleCreateFile}
            onKeyDown={handleCreateKeyDown}
            placeholder="src/Component.tsx"
            className="flex-1 bg-secondary/50 text-foreground text-xs px-1.5 py-0.5 rounded border border-primary/50 outline-none"
          />
        </div>
      )}

      {tree.map((node) => (
        <FileTreeNode
          key={node.path}
          node={node}
          depth={0}
          onSelect={onSelect}
          selectedFile={selectedFile}
          onDownloadFile={onDownloadFile}
          onRenameFile={onRenameFile}
          onDeleteFile={onDeleteFile}
        />
      ))}
    </div>
  );
}
