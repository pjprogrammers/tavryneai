'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Panel, Group as PanelGroup, useDefaultLayout } from 'react-resizable-panels';
import { ResizeHandle } from '@/components/ui/resizable-handle';
import { useRouter } from 'next/navigation';
import { ChatPanel } from './ChatPanel';
import { CodePanel } from './CodePanel';
import { PreviewPanel } from './PreviewPanel';
import { FileSearchPanel } from './FileSearchPanel';
import { FileExplorer } from './FileExplorer';
import { TokenDashboard } from './TokenDashboard';
import { TokenCounter } from './TokenCounter';
import { ModelSelector } from './ModelSelector';
import { CheckpointPanel } from './CheckpointPanel';
import { PlanModeToggle } from './PlanModeToggle';
import { ShareDialog } from './ShareDialog';
import { SettingsModal } from './SettingsModal';
import { DeployButton } from './DeployButton';
import { VisualEditPanel } from './VisualEditPanel';
import { BenchmarkDashboard } from './BenchmarkDashboard';
import { TemplateMarketplace } from './TemplateMarketplace';
import { DiffPanel } from './DiffPanel';
import { AgentTimeline, type TimelineEvent } from './AgentTimeline';
import { BottomPanel } from './BottomPanel';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { usePanelStore, detectBreakpoint, DeviceBreakpoint } from '@/lib/store/usePanelStore';
import { Project } from '@/lib/types/project';
import { AVAILABLE_MODELS } from '@/lib/types/ai';
import { PROVIDER_LABELS as providerLabels } from '@/lib/utils/constants';
import { useProjectStore } from '@/lib/store/useProjectStore';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { CommandPalette } from '@/components/shared/command-palette';
import { AIStreamingIndicator } from '@/components/shared/streaming-states';
import { ErrorBoundary } from '@/components/shared/error-boundary';
import { KeyboardShortcutsOverlay } from '@/components/shared/keyboard-shortcuts';
import { useToast } from '@/components/shared/toast';
import { Share2, Settings, BarChart3, LayoutTemplate, Brain, Clock, PanelLeft, PanelRight, PanelBottom } from 'lucide-react';
import { ProjectMemoryModal } from './ProjectMemoryModal';
import JSZip from 'jszip';

interface EditorLayoutProps {
  files: Map<string, string>;
  onFileUpdate: (path: string, content: string) => void;
  project: Project | null;
  projectId: string;
}

export function EditorLayout({ files, onFileUpdate, project, projectId }: EditorLayoutProps) {
  const router = useRouter();
  const store = useEditorStore();
  const panel = usePanelStore();
  const currentProject = useProjectStore((s) => s.currentProject);
  const selectedModel = AVAILABLE_MODELS.find((m) => m.id === currentProject?.selectedModel);
  const providerLabel = selectedModel ? providerLabels[selectedModel.provider] : 'AI';
  const { addToast } = useToast();

  const [fileSearchOpen, setFileSearchOpen] = useState(false);
  const [scrollToLine, setScrollToLine] = useState<number | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [benchmarkOpen, setBenchmarkOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [agentEvents, setAgentEvents] = useState<TimelineEvent[]>([]);
  const [showTimeline, setShowTimeline] = useState(false);

  const mainLayout = useDefaultLayout({ id: 'tavryne-editor-layout' });
  const centerLayout = useDefaultLayout({ id: 'tavryne-editor-center' });

  const { selectedFile, setSelectedFile, deviceView, setDeviceView, isReadOnly, setReadOnly, pendingDiffs, visualEditMode, isStreaming } = store;
  const { breakpoint, chatVisible, filesVisible, previewVisible, bottomOpen, toggleChat, toggleFiles, togglePreview, setBottomOpen, setChatVisible, setFilesVisible, setPreviewVisible, showAgentTimeline, setShowAgentTimeline, addRecentFile } = panel;

  const isMobile = breakpoint === 'mobile';

  useEffect(() => {
    const onResize = () => {
      panel.setBreakpoint(detectBreakpoint(window.innerWidth));
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setChatVisible(false);
      setFilesVisible(false);
      setPreviewVisible(false);
    }
  }, [isMobile]);

useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'f') {
        e.preventDefault();
        setFileSearchOpen((p) => !p);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '1') {
        e.preventDefault();
        toggleChat();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '2') {
        e.preventDefault();
        togglePreview();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '3') {
        e.preventDefault();
        toggleFiles();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '4') {
        e.preventDefault();
        setBottomOpen(!bottomOpen);
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        setShowTimeline(!showTimeline);
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setFileSearchOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        setBottomOpen(!bottomOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bottomOpen, showTimeline]);

  const downloadFile = useCallback((path: string) => {
    const content = files.get(path);
    if (!content) return;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = path.split('/').pop() || path;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [files]);

  const downloadAllAsZip = useCallback(async () => {
    if (files.size === 0) return;
    addToast('Zipping project files...', 'info');
    const zip = new JSZip();
    for (const [path, content] of files) {
      zip.file(path, content);
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-${projectId}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast(`Downloaded ${files.size} files as ZIP`, 'success');
  }, [files, projectId, addToast]);

  const handleSelectFile = useCallback((path: string | null) => {
    if (path) {
      setSelectedFile(path);
      addRecentFile(path);
      if (isMobile) setFilesVisible(false);
    }
  }, [isMobile]);

  const editorCommands = [
    { id: 'save', label: 'Save file', category: 'Editor', action: () => {} },
    { id: 'toggle-preview', label: 'Toggle preview panel', category: 'View', action: togglePreview },
    { id: 'toggle-chat', label: 'Toggle chat panel', category: 'View', action: toggleChat },
    { id: 'toggle-files', label: 'Toggle file explorer', category: 'View', action: toggleFiles },
    { id: 'toggle-terminal', label: 'Toggle bottom panel', category: 'View', action: () => setBottomOpen(!bottomOpen) },
    { id: 'toggle-readonly', label: 'Toggle read-only mode', category: 'Editor', action: () => setReadOnly(!isReadOnly) },
    { id: 'share', label: 'Share session', category: 'Project', action: () => setShareOpen(true) },
    { id: 'settings', label: 'Project settings', category: 'Project', action: () => setSettingsOpen(true) },
    { id: 'memory', label: 'Edit project memory', category: 'Project', action: () => setMemoryOpen(true) },
    { id: 'benchmarks', label: 'View model benchmarks', category: 'Project', action: () => setBenchmarkOpen(true) },
    { id: 'templates', label: 'Template marketplace', category: 'Project', action: () => setTemplateOpen(true) },
  ];

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between px-2 md:px-3 h-11 bg-card border-b border-border shrink-0">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <button
            onClick={() => router.push('/dashboard')}
            className="h-7 w-7 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors shrink-0"
            aria-label="Back to dashboard"
          >
            <svg className="h-3.5 w-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="h-5 w-[1px] bg-border shrink-0" />
          <span className="text-sm font-medium text-foreground truncate">{project?.title || 'Loading...'}</span>
          <span className="text-[10px] text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded shrink-0 hidden sm:inline">{project?.framework}</span>
        </div>

        <div className="flex items-center gap-1 md:gap-1.5">
          <div className="hidden md:flex items-center gap-1.5">
            <ModelSelector />
            <div className="h-5 w-[1px] bg-border mx-1" />
            <button
              onClick={() => setFileSearchOpen((p) => !p)}
              className={`px-2 py-1 text-[11px] rounded-md transition-colors ${fileSearchOpen ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}
              title="Search across files (⌘⇧F)"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <CommandPalette commands={editorCommands} />
            <div className="h-5 w-[1px] bg-border mx-1" />
          </div>

          <button
            onClick={() => setTemplateOpen(true)}
            className="hidden lg:inline-flex px-2 py-1 text-[11px] rounded-md transition-colors text-muted-foreground hover:text-foreground"
            title="Template marketplace"
          >
            <LayoutTemplate className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => setMemoryOpen(true)}
            className="hidden lg:inline-flex px-2 py-1 text-[11px] rounded-md transition-colors text-muted-foreground hover:text-foreground"
            title="Project memory"
          >
            <Brain className="h-3.5 w-3.5" />
          </button>

          <PlanModeToggle />
          <DeployButton />

          <div className="hidden md:flex items-center gap-0.5">
            <button
              onClick={toggleFiles}
              className={`px-2 py-1 text-[11px] rounded-md transition-colors ${filesVisible ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}
              title="Toggle file explorer"
            >
              <PanelLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={toggleChat}
              className={`px-2 py-1 text-[11px] rounded-md transition-colors ${chatVisible ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Chat
            </button>
            <button
              onClick={togglePreview}
              className={`hidden sm:inline-flex px-2 py-1 text-[11px] rounded-md transition-colors ${previewVisible ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Preview
            </button>
            <button
              onClick={() => setBottomOpen(!bottomOpen)}
              className={`hidden sm:inline-flex px-2 py-1 text-[11px] rounded-md transition-colors ${bottomOpen ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <PanelBottom className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-1.5">
            <div className="h-5 w-[1px] bg-border mx-1" />
            <select
              value={deviceView}
              onChange={(e) => setDeviceView(e.target.value as any)}
              className="bg-secondary/50 text-muted-foreground text-[11px] rounded-md px-2 py-1 border border-border/50 focus:outline-none"
            >
              <option value="desktop">Desktop</option>
              <option value="tablet">Tablet</option>
              <option value="mobile">Mobile</option>
            </select>

            <button
              onClick={downloadAllAsZip}
              className="px-2 py-1 text-[11px] rounded-md transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Download all files as ZIP"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>

            <button
              onClick={() => setShareOpen(true)}
              className="px-2 py-1 text-[11px] rounded-md transition-colors text-muted-foreground hover:text-foreground"
              title="Share session"
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => setSettingsOpen(true)}
              className="px-2 py-1 text-[11px] rounded-md transition-colors text-muted-foreground hover:text-foreground"
              title="Project settings"
            >
              <Settings className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => setBenchmarkOpen(true)}
              className="px-2 py-1 text-[11px] rounded-md transition-colors text-muted-foreground hover:text-foreground"
              title="Model benchmarks"
            >
              <BarChart3 className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => useEditorStore.getState().setShowDiffPanel(true)}
              className={`px-2 py-1 text-[11px] rounded-md transition-colors ${pendingDiffs.length > 0 ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {pendingDiffs.length > 0 ? `Changes (${pendingDiffs.length})` : 'Changes'}
            </button>
          </div>

          <ThemeToggle />
          <TokenDashboard />
        </div>
      </header>

      {/* Agent Timeline toggle */}
      <div className="flex items-center gap-1 px-3 h-6 bg-card/30 border-b border-border/30 shrink-0">
        <button
          onClick={() => setShowTimeline(!showTimeline)}
          className={`flex items-center gap-1 text-[10px] transition-colors ${showTimeline ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Clock className="h-3 w-3" />
          Agent Timeline
        </button>
        <span className="text-[10px] text-muted-foreground/50">|</span>
        <span className="text-[10px] text-muted-foreground">{breakpoint}</span>
      </div>

      <AgentTimeline events={agentEvents} visible={showTimeline} onClose={() => setShowTimeline(false)} />

      {/* Checkpoint bar */}
      <CheckpointPanel />

      {/* Streaming indicator */}
      {isStreaming && (
        <div className="px-3 pt-2">
          <AIStreamingIndicator
            isStreaming={isStreaming}
            provider={providerLabel}
            tokenCount={0}
            onCancel={() => {}}
          />
        </div>
      )}

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat mobile overlay */}
        {chatVisible && isMobile && (
          <>
            <div className="md:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setChatVisible(false)} />
            <div className="md:hidden fixed inset-y-0 left-0 z-40 w-[85vw] max-w-[360px] bg-card border-r border-border shadow-2xl animate-slide-right">
              <div className="flex items-center justify-between px-3 h-11 border-b border-border">
                <span className="text-sm font-medium">Chat</span>
                <button onClick={() => setChatVisible(false)} className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <ChatPanel projectId={projectId} />
            </div>
          </>
        )}

        {/* File explorer mobile overlay */}
        {filesVisible && isMobile && (
          <>
            <div className="md:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setFilesVisible(false)} />
            <div className="md:hidden fixed inset-y-0 left-0 z-40 w-[75vw] max-w-[300px] bg-card border-r border-border shadow-2xl animate-slide-right">
              <FileExplorer
                files={files}
                onSelect={handleSelectFile}
                selectedFile={selectedFile}
                onDownloadFile={downloadFile}
                onDownloadAll={downloadAllAsZip}
                onAddFile={(p) => {
                  useProjectStore.getState().addFile(p, '');
                  addToast(`Created ${p}`, 'success');
                }}
                onRenameFile={(o, n) => {
                  useProjectStore.getState().renameFile(o, n);
                  addToast(`Renamed ${o} → ${n}`, 'info');
                }}
                onDeleteFile={(p) => {
                  useProjectStore.getState().deleteFile(p);
                  addToast(`Deleted ${p}`, 'warning');
                }}
                onClose={() => setFilesVisible(false)}
              />
            </div>
          </>
        )}

        <PanelGroup
          id="tavryne-editor-layout"
          defaultLayout={mainLayout.defaultLayout}
          onLayoutChanged={mainLayout.onLayoutChanged}
          orientation="horizontal"
        >
          {/* Left: Chat (desktop) */}
          {!isMobile && chatVisible && (
            <>
              <Panel defaultSize={20} minSize={10} maxSize={35}>
                <div className="h-full border-r border-border bg-card/50 overflow-hidden">
                  <ErrorBoundary>
                    <ChatPanel projectId={projectId} />
                  </ErrorBoundary>
                </div>
              </Panel>
              <ResizeHandle />
            </>
          )}

          {/* Center: File Explorer + Code */}
          <Panel minSize={25} defaultSize={55}>
            <div className="flex flex-col h-full min-w-0">
              <div className="flex flex-1 overflow-hidden">
                <PanelGroup
                  id="tavryne-editor-center"
                  defaultLayout={centerLayout.defaultLayout}
                  onLayoutChanged={centerLayout.onLayoutChanged}
                  orientation="horizontal"
                >
                  {filesVisible && !isMobile && (
                    <>
                      <Panel defaultSize={15} minSize={8} maxSize={25}>
                        <div className="h-full border-r border-border bg-card/30 overflow-hidden flex flex-col">
                          <FileExplorer
                            files={files}
                            onSelect={handleSelectFile}
                            selectedFile={selectedFile}
                            onDownloadFile={downloadFile}
                            onDownloadAll={downloadAllAsZip}
                            onAddFile={(p) => {
                              useProjectStore.getState().addFile(p, '');
                              addToast(`Created ${p}`, 'success');
                            }}
                            onRenameFile={(o, n) => {
                              useProjectStore.getState().renameFile(o, n);
                              addToast(`Renamed ${o} → ${n}`, 'info');
                            }}
                            onDeleteFile={(p) => {
                              useProjectStore.getState().deleteFile(p);
                              addToast(`Deleted ${p}`, 'warning');
                            }}
                          />
                        </div>
                      </Panel>
                      <ResizeHandle />
                    </>
                  )}
                  <Panel minSize={30}>
                    <div className="h-full flex flex-col overflow-hidden min-w-0">
                      {fileSearchOpen && (
                        <FileSearchPanel
                          files={files}
                          onSelectFile={(path, line) => {
                            setSelectedFile(path);
                            setScrollToLine(line || null);
                            setTimeout(() => setScrollToLine(null), 100);
                            setFileSearchOpen(false);
                          }}
                          onClose={() => setFileSearchOpen(false)}
                        />
                      )}
                      <div className="flex-1 overflow-hidden">
                        <ErrorBoundary>
                          <CodePanel
                            files={files}
                            selectedFile={selectedFile}
                            isReadOnly={isReadOnly}
                            scrollToLine={scrollToLine}
                            onToggleReadOnly={() => setReadOnly(!isReadOnly)}
                            onSave={onFileUpdate}
                          />
                        </ErrorBoundary>
                      </div>
                      <VisualEditPanel />
                    </div>
                  </Panel>
                </PanelGroup>
              </div>
            </div>
          </Panel>

          {/* Right: Preview */}
          {previewVisible && !isMobile && (
            <>
              <ResizeHandle />
              <Panel defaultSize={25} minSize={10} maxSize={50}>
                <div className="h-full border-l border-border bg-card overflow-hidden">
                  <ErrorBoundary>
                    <PreviewPanel
                      files={files}
                      onFixWithAI={(error) => {
                        useEditorStore.getState().triggerAutoFix(error);
                        addToast('Auto-fix triggered. Sending error to AI...', 'info');
                      }}
                    />
                  </ErrorBoundary>
                </div>
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>

      {/* Bottom panel */}
      <BottomPanel />

      {/* Diff panel */}
      <DiffPanel />

      {/* Keyboard shortcuts overlay */}
      <KeyboardShortcutsOverlay />

      {/* Dialogs */}
      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} />
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      <ProjectMemoryModal open={memoryOpen} onOpenChange={setMemoryOpen} />
      <BenchmarkDashboard open={benchmarkOpen} onOpenChange={setBenchmarkOpen} />
      <TemplateMarketplace open={templateOpen} onOpenChange={setTemplateOpen} />
    </div>
  );
}
