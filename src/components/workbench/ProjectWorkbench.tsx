'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Project } from '@/lib/types/project';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { useProjectStore } from '@/lib/store/useProjectStore';
import { usePanelStore, detectBreakpoint } from '@/lib/store/usePanelStore';
import { useToast } from '@/components/shared/toast';
import { cn } from '@/lib/utils/cn';

import { WorkbenchTopBar } from './WorkbenchTopBar';
import { WorkbenchMobileNav, type WorkbenchTab } from './WorkbenchMobileNav';
import { WorkbenchChat } from './WorkbenchChat';
import { WorkbenchFileExplorer } from './WorkbenchFileExplorer';
import { WorkbenchCodePanel } from './WorkbenchCodePanel';
import { WorkbenchPreviewPanel } from './WorkbenchPreviewPanel';
import { CommandPalette } from '@/components/shared/command-palette';
import { KeyboardShortcutsOverlay } from '@/components/shared/keyboard-shortcuts';
import { ErrorBoundary } from '@/components/shared/error-boundary';
import { CheckpointPanel } from '@/components/editor/CheckpointPanel';
import { DiffPanel } from '@/components/editor/DiffPanel';
import { VisualEditPanel } from '@/components/editor/VisualEditPanel';
import { PlanModeToggle } from '@/components/editor/PlanModeToggle';
import { DeployButton } from '@/components/editor/DeployButton';
import { ShareDialog } from '@/components/editor/ShareDialog';
import { SettingsModal } from '@/components/editor/SettingsModal';
import { BenchmarkDashboard } from '@/components/editor/BenchmarkDashboard';
import { TemplateMarketplace } from '@/components/editor/TemplateMarketplace';
import { ProjectMemoryModal } from '@/components/editor/ProjectMemoryModal';
import { BottomPanel } from '@/components/editor/BottomPanel';

// Lazy-load the 3D background for performance on mobile
const WorkbenchBackground = dynamic(
  () => import('./WorkbenchBackground').then((m) => m.WorkbenchBackground),
  { ssr: false },
);

interface ProjectWorkbenchProps {
  files: Map<string, string>;
  onFileUpdate: (path: string, content: string) => void;
  project: Project | null;
  projectId: string;
}

const MOBILE_DEFAULT_TAB: WorkbenchTab = 'chat';

export function ProjectWorkbench({
  files,
  onFileUpdate,
  project,
  projectId,
}: ProjectWorkbenchProps) {
  const editor = useEditorStore();
  const projectStore = useProjectStore();
  const panel = usePanelStore();
  const { addToast } = useToast();

  const [mobileTab, setMobileTab] = useState<WorkbenchTab>(MOBILE_DEFAULT_TAB);
  const [searchOpen, setSearchOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [benchmarkOpen, setBenchmarkOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const isMobile = panel.breakpoint === 'mobile';
  const isReadOnly = editor.isReadOnly;
  const isStreaming = editor.isStreaming;
  const selectedFile = editor.selectedFile;
  const triggerAutoFix = editor.triggerAutoFix;
  const setReadOnly = editor.setReadOnly;

  // Breakpoint detection
  useEffect(() => {
    const onResize = () => {
      const bp = detectBreakpoint(window.innerWidth);
      panel.setBreakpoint(bp);
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reduced motion detection
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
      if (mod && e.key === '1') {
        e.preventDefault();
        if (isMobile) setMobileTab('chat');
        else panel.toggleChat();
      }
      if (mod && e.key === '2') {
        e.preventDefault();
        if (isMobile) setMobileTab('code');
        else panel.togglePreview();
      }
      if (mod && e.key === '3') {
        e.preventDefault();
        if (isMobile) setMobileTab('files');
        else panel.toggleFiles();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMobile, panel]);

  // File actions
  const handleAddFile = useCallback(
    (path: string) => {
      projectStore.addFile(path, '');
      addToast(`Created ${path}`, 'success');
    },
    [projectStore, addToast],
  );
  const handleRenameFile = useCallback(
    (oldPath: string, newPath: string) => {
      projectStore.renameFile(oldPath, newPath);
      addToast(`Renamed`, 'info');
    },
    [projectStore, addToast],
  );
  const handleDeleteFile = useCallback(
    (path: string) => {
      projectStore.deleteFile(path);
      addToast(`Deleted ${path}`, 'warning');
    },
    [projectStore, addToast],
  );

  const handleSelectFile = useCallback(
    (path: string | null) => {
      if (path) {
        editor.setSelectedFile(path);
        panel.addRecentFile(path);
        if (isMobile) setMobileTab('code');
      }
    },
    [editor, panel, isMobile],
  );

  const commands = useMemo(
    () => [
      { id: 'toggle-readonly', label: 'Toggle read-only mode', category: 'Editor', action: () => setReadOnly(!isReadOnly) },
      { id: 'share', label: 'Share session', category: 'Project', action: () => setShareOpen(true) },
      { id: 'settings', label: 'Project settings', category: 'Project', action: () => setSettingsOpen(true) },
      { id: 'memory', label: 'Edit project memory', category: 'Project', action: () => setMemoryOpen(true) },
      { id: 'benchmarks', label: 'View model benchmarks', category: 'Project', action: () => setBenchmarkOpen(true) },
      { id: 'templates', label: 'Template marketplace', category: 'Project', action: () => setTemplateOpen(true) },
    ],
    [isReadOnly, setReadOnly],
  );

  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-background"
      role="application"
      aria-label={`Project workbench for ${project?.title || 'current project'}`}
    >
      <h1 className="sr-only">
        {project?.title ? `${project.title} — AI Project Editor` : 'AI Project Editor — Tavryne AI'}
      </h1>
      {/* 3D aurora background (lazy) */}
      <WorkbenchBackground reducedMotion={reducedMotion} />
      {/* Subtle grid overlay */}
      <div className="pointer-events-none fixed inset-0 wb-grid opacity-30" aria-hidden />

      <div className="relative h-full flex flex-col">
        <WorkbenchTopBar
          project={project}
          projectId={projectId}
          files={files}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenShare={() => setShareOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenBenchmarks={() => setBenchmarkOpen(true)}
          onOpenTemplates={() => setTemplateOpen(true)}
          onOpenMemory={() => setMemoryOpen(true)}
          onOpenHistory={() => {
            const cp = document.querySelector('[data-checkpoint-toggle]') as HTMLButtonElement | null;
            cp?.click();
          }}
        />

        <CheckpointPanel />

        <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-2 sm:gap-3 px-2 sm:px-3 pb-2 sm:pb-3">
          {/* ====== DESKTOP LAYOUT ====== */}
          {!isMobile && (
            <DesktopLayout
              panel={panel}
              isReadOnly={isReadOnly}
              selectedFile={selectedFile}
              files={files}
              onFileUpdate={onFileUpdate}
              onSelectFile={handleSelectFile}
              onAddFile={handleAddFile}
              onRenameFile={handleRenameFile}
              onDeleteFile={handleDeleteFile}
              projectId={projectId}
              onFixWithAI={(err) => {
                triggerAutoFix(err);
                addToast('Auto-fix triggered', 'info');
              }}
            />
          )}

          {/* ====== MOBILE LAYOUT ====== */}
          {isMobile && (
            <MobileLayout
              tab={mobileTab}
              files={files}
              selectedFile={selectedFile}
              isReadOnly={isReadOnly}
              isStreaming={isStreaming}
              onFileUpdate={onFileUpdate}
              onSelectFile={handleSelectFile}
              onAddFile={handleAddFile}
              onRenameFile={handleRenameFile}
              onDeleteFile={handleDeleteFile}
              projectId={projectId}
              onFixWithAI={(err) => {
                triggerAutoFix(err);
                addToast('Auto-fix triggered', 'info');
              }}
              onChangeTab={setMobileTab}
            />
          )}
        </div>
      </div>

      <CommandPalette commands={commands} />
      <KeyboardShortcutsOverlay />
      <FileSearchSheet
        open={searchOpen}
        onOpenChange={setSearchOpen}
        files={files}
        onSelect={(path, line) => {
          editor.setSelectedFile(path);
          if (isMobile) setMobileTab('code');
        }}
      />

      {/* Modals */}
      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} />
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      <ProjectMemoryModal open={memoryOpen} onOpenChange={setMemoryOpen} />
      <BenchmarkDashboard open={benchmarkOpen} onOpenChange={setBenchmarkOpen} />
      <TemplateMarketplace open={templateOpen} onOpenChange={setTemplateOpen} />
      <BottomPanel />
      <DiffPanel />
      <VisualEditPanel />

      {/* Floating controls visible on desktop only */}
      {!isMobile && (
        <div className="hidden md:flex fixed bottom-3 right-3 z-20 items-center gap-2">
          <PlanModeToggle />
          <DeployButton />
        </div>
      )}
    </div>
  );
}

// ====================================================================
// DESKTOP LAYOUT — 3-pane resizable
// ====================================================================

interface DesktopLayoutProps {
  panel: ReturnType<typeof usePanelStore.getState>;
  isReadOnly: boolean;
  selectedFile: string | null;
  files: Map<string, string>;
  onFileUpdate: (path: string, content: string) => void;
  onSelectFile: (p: string | null) => void;
  onAddFile: (p: string) => void;
  onRenameFile: (o: string, n: string) => void;
  onDeleteFile: (p: string) => void;
  projectId: string;
  onFixWithAI: (err: string) => void;
}

function DesktopLayout({
  panel,
  isReadOnly,
  selectedFile,
  files,
  onFileUpdate,
  onSelectFile,
  onAddFile,
  onRenameFile,
  onDeleteFile,
  projectId,
  onFixWithAI,
}: DesktopLayoutProps) {
  return (
    <div className="flex-1 min-h-0 flex gap-2 sm:gap-3">
      {/* Left rail: files */}
      <AnimatePresence initial={false}>
        {panel.filesVisible && (
          <motion.aside
            key="files"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.2, 0.7, 0.2, 1] }}
            className="wb-glass rounded-2xl overflow-hidden shrink-0 hidden md:flex flex-col"
          >
            <div className="flex-1 min-h-0">
              <WorkbenchFileExplorer
                files={files}
                onSelect={onSelectFile}
                selectedFile={selectedFile}
                onAddFile={onAddFile}
                onRenameFile={onRenameFile}
                onDeleteFile={onDeleteFile}
              />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Center: chat + code (stacked or split) */}
      <div className="flex-1 min-w-0 flex gap-2 sm:gap-3">
        <AnimatePresence initial={false}>
          {panel.chatVisible && (
            <motion.section
              key="chat"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 380, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.2, 0.7, 0.2, 1] }}
              className="wb-glass rounded-2xl overflow-hidden shrink-0 hidden lg:flex flex-col"
            >
              <WorkbenchChat projectId={projectId} />
            </motion.section>
          )}
        </AnimatePresence>

        <section className="flex-1 min-w-0 wb-glass rounded-2xl overflow-hidden flex flex-col">
          <ErrorBoundary>
            <WorkbenchCodePanel
              files={files}
              selectedFile={selectedFile}
              isReadOnly={isReadOnly}
              onToggleReadOnly={() => useEditorStore.getState().setReadOnly(!isReadOnly)}
              onSave={onFileUpdate}
            />
          </ErrorBoundary>
        </section>
      </div>

      {/* Right rail: preview */}
      <AnimatePresence initial={false}>
        {panel.previewVisible && (
          <motion.aside
            key="preview"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 420, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.2, 0.7, 0.2, 1] }}
            className="wb-glass rounded-2xl overflow-hidden shrink-0 hidden xl:flex flex-col"
          >
            <ErrorBoundary>
              <WorkbenchPreviewPanel files={files} onFixWithAI={onFixWithAI} />
            </ErrorBoundary>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

// ====================================================================
// MOBILE LAYOUT — single pane + bottom nav
// ====================================================================

interface MobileLayoutProps {
  tab: WorkbenchTab;
  files: Map<string, string>;
  selectedFile: string | null;
  isReadOnly: boolean;
  isStreaming: boolean;
  onFileUpdate: (path: string, content: string) => void;
  onSelectFile: (p: string | null) => void;
  onAddFile: (p: string) => void;
  onRenameFile: (o: string, n: string) => void;
  onDeleteFile: (p: string) => void;
  projectId: string;
  onFixWithAI: (err: string) => void;
  onChangeTab: (t: WorkbenchTab) => void;
}

function MobileLayout({
  tab,
  files,
  selectedFile,
  isReadOnly,
  isStreaming,
  onFileUpdate,
  onSelectFile,
  onAddFile,
  onRenameFile,
  onDeleteFile,
  projectId,
  onFixWithAI,
  onChangeTab,
}: MobileLayoutProps) {
  return (
    <>
      <div className="flex-1 min-h-0 wb-glass rounded-2xl overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {tab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="flex-1 min-h-0 flex flex-col"
            >
              <WorkbenchChat projectId={projectId} variant="sheet" />
            </motion.div>
          )}
          {tab === 'files' && (
            <motion.div
              key="files"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="flex-1 min-h-0 flex flex-col"
            >
              <WorkbenchFileExplorer
                files={files}
                onSelect={onSelectFile}
                selectedFile={selectedFile}
                onAddFile={onAddFile}
                onRenameFile={onRenameFile}
                onDeleteFile={onDeleteFile}
                variant="sheet"
              />
            </motion.div>
          )}
          {tab === 'code' && (
            <motion.div
              key="code"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="flex-1 min-h-0 flex flex-col"
            >
              <ErrorBoundary>
                <WorkbenchCodePanel
                  files={files}
                  selectedFile={selectedFile}
                  isReadOnly={isReadOnly}
                  onToggleReadOnly={() => useEditorStore.getState().setReadOnly(!isReadOnly)}
                  onSave={onFileUpdate}
                />
              </ErrorBoundary>
            </motion.div>
          )}
          {tab === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="flex-1 min-h-0 flex flex-col"
            >
              <ErrorBoundary>
                <WorkbenchPreviewPanel files={files} onFixWithAI={onFixWithAI} />
              </ErrorBoundary>
            </motion.div>
          )}
          {tab === 'diff' && (
            <motion.div
              key="diff"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="flex-1 min-h-0 flex flex-col p-2"
            >
              <MobileDiffsList />
            </motion.div>
          )}
          {tab === 'terminal' && (
            <motion.div
              key="terminal"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="flex-1 min-h-0 flex flex-col"
            >
              <BottomPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <WorkbenchMobileNav
        active={tab}
        onChange={onChangeTab}
        fileCount={files.size}
      />
    </>
  );
}

function MobileDiffsList() {
  const diffs = useEditorStore((s) => s.pendingDiffs);
  const accept = useEditorStore((s) => s.acceptDiff);
  const reject = useEditorStore((s) => s.rejectDiff);
  const acceptAll = useEditorStore((s) => s.acceptAllDiffs);
  const rejectAll = useEditorStore((s) => s.rejectAllDiffs);
  if (diffs.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-center p-6">
        <div>
          <div
            className="h-14 w-14 mx-auto rounded-2xl bg-secondary/40 flex items-center justify-center mb-3"
            style={{ transform: 'perspective(400px) rotateX(8deg) rotateY(-8deg)' }}
          >
            <span className="text-2xl">✨</span>
          </div>
          <p className="text-sm font-medium text-foreground">No pending changes</p>
          <p className="text-[11px] text-muted-foreground mt-1">
            AI modifications will appear here for review
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/40">
        <span className="text-[12px] font-semibold">
          {diffs.filter((d) => d.status === 'pending').length} pending
        </span>
        <div className="flex gap-2">
          <button
            onClick={rejectAll}
            className="text-[11px] h-7 px-2.5 rounded-lg border border-border/60 wb-press"
          >
            Reject all
          </button>
          <button
            onClick={acceptAll}
            className="text-[11px] h-7 px-2.5 rounded-lg gradient-primary text-white font-medium wb-press"
          >
            Accept all
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {diffs.map((d) => (
          <div
            key={d.filename}
            className={cn(
              'wb-card p-2.5',
              d.status === 'accepted' && 'opacity-60',
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'text-[9px] font-bold px-1.5 py-0.5 rounded',
                  d.newContent === '' && d.oldContent !== ''
                    ? 'bg-red-500/15 text-red-500'
                    : d.oldContent
                    ? 'bg-amber-500/15 text-amber-500'
                    : 'bg-green-500/15 text-green-500',
                )}
              >
                {d.newContent === '' && d.oldContent !== ''
                  ? 'DELETE'
                  : d.oldContent
                  ? 'MODIFY'
                  : 'CREATE'}
              </span>
              <span className="text-[11px] font-mono truncate flex-1">{d.filename}</span>
            </div>
            {d.status === 'pending' && (
              <div className="flex gap-1.5 mt-2">
                <button
                  onClick={() => reject(d.filename)}
                  className="flex-1 h-7 text-[11px] rounded-md border border-border/60 wb-press"
                >
                  Reject
                </button>
                <button
                  onClick={() => accept(d.filename)}
                  className="flex-1 h-7 text-[11px] rounded-md bg-green-500/20 text-green-500 font-medium wb-press"
                >
                  Accept
                </button>
              </div>
            )}
            {d.status === 'accepted' && (
              <p className="text-[10px] text-green-500 mt-1">Accepted</p>
            )}
            {d.status === 'rejected' && (
              <p className="text-[10px] text-red-500 mt-1">Rejected</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ====================================================================
// FILE SEARCH SHEET
// ====================================================================

function FileSearchSheet({
  open,
  onOpenChange,
  files,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  files: Map<string, string>;
  onSelect: (path: string, line?: number) => void;
}) {
  const [q, setQ] = useState('');
  const results = useMemo(() => {
    if (!q.trim()) return [];
    const query = q.toLowerCase();
    const out: { path: string; line: number; preview: string }[] = [];
    for (const [path, content] of files) {
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes(query)) {
          out.push({ path, line: i + 1, preview: lines[i].trim().slice(0, 80) });
          if (out.length > 30) return out;
        }
      }
    }
    return out;
  }, [q, files]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-start justify-center pt-20 sm:pt-28 px-3"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            className="w-full max-w-xl wb-glass-strong rounded-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 px-2 h-10 border-b border-border/40">
              <span className="text-muted-foreground text-sm">🔎</span>
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search across files…"
                className="flex-1 bg-transparent text-sm outline-none"
              />
            </div>
            <div className="max-h-80 overflow-y-auto py-1">
              {q && results.length === 0 && (
                <p className="text-[12px] text-muted-foreground px-3 py-3">
                  No matches found
                </p>
              )}
              {results.map((r, i) => (
                <button
                  key={`${r.path}-${r.line}-${i}`}
                  onClick={() => {
                    onSelect(r.path, r.line);
                    onOpenChange(false);
                    setQ('');
                  }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary/60 wb-press"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 rounded">
                      L{r.line}
                    </span>
                    <span className="text-[11px] font-mono text-foreground truncate flex-1">
                      {r.path}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono truncate mt-0.5 pl-7">
                    {r.preview}
                  </p>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
