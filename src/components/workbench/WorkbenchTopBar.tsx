'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Share2,
  Settings,
  BarChart3,
  LayoutTemplate,
  Brain,
  Search,
  History,
  MoreVertical,
  Download,
} from 'lucide-react';
import { TokenRing } from './TokenRing';
import { ModelSelector } from '@/components/editor/ModelSelector';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Project } from '@/lib/types/project';
import JSZip from 'jszip';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { useToast } from '@/components/shared/toast';
import { cn } from '@/lib/utils/cn';

interface WorkbenchTopBarProps {
  project: Project | null;
  projectId: string;
  files: Map<string, string>;
  onOpenSearch: () => void;
  onOpenShare: () => void;
  onOpenSettings: () => void;
  onOpenBenchmarks: () => void;
  onOpenTemplates: () => void;
  onOpenMemory: () => void;
  onOpenHistory: () => void;
}

export function WorkbenchTopBar({
  project,
  projectId,
  files,
  onOpenSearch,
  onOpenShare,
  onOpenSettings,
  onOpenBenchmarks,
  onOpenTemplates,
  onOpenMemory,
  onOpenHistory,
}: WorkbenchTopBarProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const { addToast } = useToast();
  const pendingDiffs = useEditorStore((s) => s.pendingDiffs);

  const downloadAll = async () => {
    if (files.size === 0) return;
    addToast('Zipping project files...', 'info');
    const zip = new JSZip();
    for (const [path, content] of files) zip.file(path, content);
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-${projectId}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast(`Downloaded ${files.size} files`, 'success');
  };

  return (
    <header className="sticky top-0 z-30 safe-pt">
      <div className="wb-glass mx-2 mt-2 sm:mx-3 sm:mt-3 flex items-center gap-2 sm:gap-3 rounded-2xl px-2.5 sm:px-3.5 h-12 sm:h-14">
        {/* Logo (3D tilt) */}
        <Link
          href="/dashboard"
          className="group relative h-8 w-8 sm:h-9 sm:w-9 shrink-0 rounded-xl wb-tilt"
          aria-label="Back to dashboard"
          style={{ transform: 'perspective(400px) rotateX(8deg) rotateY(-8deg)' }}
        >
          <img src="/icon-32x32.png" alt="" className="absolute inset-0 h-full w-full rounded-xl" />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-5 rounded-full bg-primary/40 blur-sm" />
        </Link>

        {/* Title + framework */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] sm:text-sm font-semibold text-foreground truncate leading-tight">
              {project?.title ?? 'Loading…'}
            </span>
            <div className="hidden sm:flex items-center gap-1.5 mt-0.5">
              <span className="wb-chip text-[9px] !py-0">
                {project?.framework ?? 'nextjs'}
              </span>
              <span className="text-[10px] text-muted-foreground/70">
                {files.size} files
              </span>
            </div>
          </div>
        </div>

        {/* Desktop primary actions */}
        <div className="hidden md:flex items-center gap-1.5">
          <ModelSelector />
          <IconBtn
            onClick={onOpenSearch}
            title="Search files (⌘⇧F)"
            icon={<Search className="h-3.5 w-3.5" />}
          />
          <IconBtn
            onClick={onOpenTemplates}
            title="Templates"
            icon={<LayoutTemplate className="h-3.5 w-3.5" />}
          />
          <IconBtn
            onClick={onOpenMemory}
            title="Project memory"
            icon={<Brain className="h-3.5 w-3.5" />}
          />
          <IconBtn
            onClick={onOpenHistory}
            title="Checkpoints"
            icon={<History className="h-3.5 w-3.5" />}
          />
          <IconBtn
            onClick={downloadAll}
            title="Download ZIP"
            icon={<Download className="h-3.5 w-3.5" />}
          />
          <IconBtn
            onClick={onOpenShare}
            title="Share"
            icon={<Share2 className="h-3.5 w-3.5" />}
          />
          <IconBtn
            onClick={onOpenSettings}
            title="Settings"
            icon={<Settings className="h-3.5 w-3.5" />}
          />
          <IconBtn
            onClick={onOpenBenchmarks}
            title="Benchmarks"
            icon={<BarChart3 className="h-3.5 w-3.5" />}
          />
          <span className="mx-1 h-5 w-px bg-border/60" />
          <TokenRing size={36} stroke={4} showLabel />
          <ThemeToggle />
        </div>

        {/* Mobile primary actions */}
        <div className="flex md:hidden items-center gap-1.5">
          <TokenRing size={32} stroke={3.5} />
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className={cn(
              'h-9 w-9 rounded-xl flex items-center justify-center wb-press',
              menuOpen
                ? 'bg-primary/15 text-primary'
                : 'bg-secondary/50 text-foreground',
            )}
            aria-label="More actions"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-2 top-[60px] sm:top-[68px] w-60 wb-glass-strong rounded-2xl p-1.5 z-50 md:hidden"
            >
              <MobileMenuItem
                onClick={() => {
                  setMenuOpen(false);
                  onOpenSearch();
                }}
                icon={<Search className="h-4 w-4" />}
                label="Search files"
              />
              <MobileMenuItem
                onClick={() => {
                  setMenuOpen(false);
                  onOpenTemplates();
                }}
                icon={<LayoutTemplate className="h-4 w-4" />}
                label="Templates"
              />
              <MobileMenuItem
                onClick={() => {
                  setMenuOpen(false);
                  onOpenMemory();
                }}
                icon={<Brain className="h-4 w-4" />}
                label="Project memory"
              />
              <MobileMenuItem
                onClick={() => {
                  setMenuOpen(false);
                  onOpenHistory();
                }}
                icon={<History className="h-4 w-4" />}
                label="Checkpoints"
              />
              <div className="my-1 wb-divider" />
              <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground/60">
                Model
              </div>
              <div className="px-1 pb-1">
                <ModelSelector />
              </div>
              <div className="my-1 wb-divider" />
              <MobileMenuItem
                onClick={() => {
                  setMenuOpen(false);
                  downloadAll();
                }}
                icon={<Download className="h-4 w-4" />}
                label="Download ZIP"
              />
              <MobileMenuItem
                onClick={() => {
                  setMenuOpen(false);
                  onOpenShare();
                }}
                icon={<Share2 className="h-4 w-4" />}
                label="Share session"
              />
              <MobileMenuItem
                onClick={() => {
                  setMenuOpen(false);
                  onOpenSettings();
                }}
                icon={<Settings className="h-4 w-4" />}
                label="Settings"
              />
              <MobileMenuItem
                onClick={() => {
                  setMenuOpen(false);
                  onOpenBenchmarks();
                }}
                icon={<BarChart3 className="h-4 w-4" />}
                label="Benchmarks"
              />
              <div className="my-1 wb-divider" />
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

function IconBtn({
  icon,
  onClick,
  title,
  active,
}: {
  icon: React.ReactNode;
  onClick?: () => void;
  title?: string;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        'h-8 w-8 rounded-lg flex items-center justify-center wb-press transition-colors',
        active
          ? 'bg-primary/15 text-primary'
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70',
      )}
    >
      {icon}
    </button>
  );
}

function MobileMenuItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-secondary/60 wb-press transition-colors"
    >
      <span className="text-muted-foreground">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
    </button>
  );
}
