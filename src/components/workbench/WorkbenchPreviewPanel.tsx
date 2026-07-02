'use client';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Monitor,
  Smartphone,
  Tablet,
  Tv,
  Maximize2,
  Cog,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  Wrench,
  PlayCircle,
  Sparkles,
} from 'lucide-react';
import {
  bundleFiles,
  buildVanillaPreview,
  resolveFileContent,
  revokeBlobUrls,
  detectProjectType,
} from '@/lib/bundler/preview';
import {
  usePanelStore,
  PreviewDevice,
  PREVIEW_DEVICE_SIZES,
} from '@/lib/store/usePanelStore';
import { cn } from '@/lib/utils/cn';

interface WorkbenchPreviewPanelProps {
  files: Map<string, string>;
  onFixWithAI?: (error: string) => void;
  onClose?: () => void;
}

const deviceOptions: {
  id: PreviewDevice;
  label: string;
  icon: typeof Monitor;
}[] = [
  { id: 'mobile', label: 'Mobile', icon: Smartphone },
  { id: 'tablet', label: 'Tablet', icon: Tablet },
  { id: 'desktop', label: 'Desktop', icon: Monitor },
  { id: 'tv', label: 'TV', icon: Tv },
  { id: 'ultrawide', label: 'Ultrawide', icon: Maximize2 },
  { id: 'custom', label: 'Custom', icon: Cog },
];

export function WorkbenchPreviewPanel({
  files,
  onFixWithAI,
  onClose,
}: WorkbenchPreviewPanelProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const cancelledRef = useRef(false);

  const {
    previewDevice,
    setPreviewDevice,
    customPreviewWidth,
    customPreviewHeight,
    setCustomPreviewSize,
  } = usePanelStore();

  const [customW, setCustomW] = useState(customPreviewWidth.toString());
  const [customH, setCustomH] = useState(customPreviewHeight.toString());
  const [showCustom, setShowCustom] = useState(false);

  const projectInfo = useMemo(() => detectProjectType(files), [files]);
  const projectType = projectInfo.type;

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'preview-error') {
        setRuntimeError(e.data.message);
        setError(`Runtime error: ${e.data.message}`);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const htmlSrcdoc = useMemo(() => {
    if (projectType !== 'vanilla' || files.size === 0) return null;
    const htmlContent = projectInfo.entryPoint
      ? files.get(projectInfo.entryPoint) || null
      : null;
    if (!htmlContent) return null;
    let modified = htmlContent;
    modified = modified.replace(
      /<link\s+[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*\/?>/gi,
      (_: string, href: string) => {
        const content = resolveFileContent(href, files);
        return content !== null ? `<style>${content}</style>` : _;
      },
    );
    modified = modified.replace(
      /<script\s+[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi,
      (_: string, src: string) => {
        if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//'))
          return _;
        const content = resolveFileContent(src, files);
        return content !== null ? `<script>${content}</script>` : _;
      },
    );
    return modified;
  }, [files, projectType, projectInfo]);

  const setupMd = useMemo(() => {
    return files.get('SETUP.md') || files.get('README.md') || '';
  }, [files]);

  const updatePreview = useCallback(async () => {
    cancelledRef.current = false;
    if (files.size === 0) return;
    if (projectType === 'vanilla' || projectType === 'python') {
      setLoading(false);
      setError(null);
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
      setPreviewUrl(null);
      return;
    }
    setLoading(true);
    setError(null);
    setRuntimeError(null);
    try {
      const url = await bundleFiles(files, projectInfo.entryPoint || 'index.tsx');
      if (!cancelledRef.current) {
        if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = url;
        setPreviewUrl(url);
      }
    } catch (err: any) {
      if (!cancelledRef.current) setError(err.message || 'Failed to bundle');
    } finally {
      if (!cancelledRef.current) setLoading(false);
    }
  }, [files, projectType, projectInfo.entryPoint]);

  useEffect(() => {
    cancelledRef.current = true;
    revokeBlobUrls();
    const t = setTimeout(() => updatePreview(), 500);
    return () => {
      cancelledRef.current = true;
      clearTimeout(t);
    };
  }, [updatePreview]);

  const handleRestart = useCallback(() => {
    setError(null);
    setRuntimeError(null);
    updatePreview();
  }, [updatePreview]);

  const previewStyle = useMemo(() => {
    if (previewDevice === 'desktop' && !showCustom) {
      return {
        containerStyle: {},
        frameStyle: { width: '100%', height: '100%' },
        scale: 1,
      };
    }
    const size = PREVIEW_DEVICE_SIZES[previewDevice];
    let w: number, h: number;
    if (previewDevice === 'custom' || showCustom) {
      w = parseInt(customW) || 1440;
      h = parseInt(customH) || 900;
    } else if (size) {
      w = size.width;
      h = size.height;
    } else {
      return {
        containerStyle: {},
        frameStyle: { width: '100%', height: '100%' },
        scale: 1,
      };
    }
    return {
      containerStyle: { width: w, height: h },
      frameStyle: { width: w, height: h },
      scale: 1,
      isDevice: true,
    };
  }, [previewDevice, customW, customH, showCustom]);

  const handleCustomApply = useCallback(() => {
    const w = parseInt(customW) || 1440;
    const h = parseInt(customH) || 900;
    setCustomPreviewSize(w, h);
    setShowCustom(false);
  }, [customW, customH, setCustomPreviewSize]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="px-3 sm:px-4 h-12 border-b border-border/40 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30 flex items-center justify-center">
            <PlayCircle className="h-3 w-3 text-emerald-400" />
          </div>
          <span className="text-[12px] font-semibold text-foreground">Preview</span>
          {projectType === 'nextjs' && (
            <span className="text-[9px] text-primary font-medium uppercase tracking-wider hidden sm:inline">
              Next.js
            </span>
          )}
          {loading && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <RefreshCw className="h-2.5 w-2.5 animate-spin" />
              Bundling
            </span>
          )}
        </div>

        <div className="flex items-center gap-0.5">
          {deviceOptions.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                if (id === 'custom') {
                  setShowCustom((s) => !s);
                } else {
                  setPreviewDevice(id);
                  setShowCustom(false);
                }
              }}
              className={cn(
                'h-7 w-7 rounded-md flex items-center justify-center wb-press transition-colors',
                previewDevice === id && !showCustom
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60',
              )}
              title={label}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
          <span className="mx-1 h-4 w-px bg-border/60" />
          <button
            onClick={handleRestart}
            className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 wb-press"
            title="Refresh"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          {previewUrl && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 wb-press"
              title="Open in new tab"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 wb-press ml-1"
              aria-label="Close preview"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Custom size input */}
      <AnimatePresence>
        {showCustom && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 border-b border-border/40"
          >
            <input
              value={customW}
              onChange={(e) => setCustomW(e.target.value)}
              placeholder="W"
              className="w-14 h-7 bg-secondary/40 text-[11px] text-foreground px-1.5 rounded-md border border-border/40 outline-none"
            />
            <span className="text-[10px] text-muted-foreground">×</span>
            <input
              value={customH}
              onChange={(e) => setCustomH(e.target.value)}
              placeholder="H"
              className="w-14 h-7 bg-secondary/40 text-[11px] text-foreground px-1.5 rounded-md border border-border/40 outline-none"
            />
            <button
              onClick={handleCustomApply}
              className="text-[10px] h-7 px-2.5 rounded-md bg-primary text-primary-foreground font-medium"
            >
              Apply
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canvas */}
      <div
        className={cn(
          'flex-1 min-h-0 relative overflow-auto',
          (previewDevice !== 'desktop' || showCustom) && 'bg-checker',
        )}
        style={
          (previewDevice !== 'desktop' || showCustom)
            ? {
                backgroundImage:
                  'repeating-conic-gradient(hsl(var(--wb-bg-2) / 0.6) 0% 25%, transparent 0% 50%)',
                backgroundSize: '20px 20px',
              }
            : {}
        }
      >
        <div className="absolute inset-0 flex items-start justify-center p-2 sm:p-4">
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-md z-10"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="relative h-12 w-12">
                    <div className="absolute inset-0 rounded-2xl gradient-primary opacity-30 animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">Bundling preview…</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error state */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center z-10 p-4">
              <div className="text-center max-w-sm w-full wb-card p-5">
                <div
                  className="h-12 w-12 mx-auto rounded-2xl bg-destructive/15 flex items-center justify-center mb-3"
                  style={{ transform: 'perspective(400px) rotateX(8deg) rotateY(-8deg)' }}
                >
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">
                  {runtimeError ? 'Runtime error' : 'Build error'}
                </p>
                <div className="text-[11px] text-left text-muted-foreground mb-3 font-mono bg-secondary/50 p-2.5 rounded-lg max-h-32 overflow-y-auto break-all border border-border/40">
                  <code>{error}</code>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={handleRestart}
                    className="text-xs h-8 px-3 rounded-lg border border-border/60 text-foreground hover:bg-secondary/60 wb-press flex items-center gap-1.5"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Restart
                  </button>
                  {onFixWithAI && (
                    <button
                      onClick={() => onFixWithAI(error)}
                      className="text-xs h-8 px-3 rounded-lg gradient-primary text-white font-semibold wb-press flex items-center gap-1.5"
                    >
                      <Wrench className="h-3 w-3" />
                      Fix with AI
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Device frame (mobile/tablet/etc) */}
          {(previewDevice !== 'desktop' || showCustom) && previewStyle.isDevice && (
            <DeviceFrame
              style={previewStyle.frameStyle as React.CSSProperties}
              device={previewDevice}
            >
              {htmlSrcdoc && !error && !runtimeError && (
                <iframe
                  srcDoc={htmlSrcdoc}
                  className="border-0 w-full h-full"
                  title="Preview"
                  sandbox="allow-scripts allow-modals"
                />
              )}
              {previewUrl && !error && !htmlSrcdoc && projectType !== 'python' && (
                <iframe
                  src={previewUrl}
                  className="border-0 w-full h-full"
                  title="Preview"
                  sandbox="allow-scripts allow-modals"
                />
              )}
            </DeviceFrame>
          )}

          {/* Desktop (full) */}
          {(previewDevice === 'desktop' && !showCustom) && (
            <>
              {htmlSrcdoc && !error && !runtimeError && (
                <iframe
                  srcDoc={htmlSrcdoc}
                  className="w-full h-full border-0 rounded-xl"
                  title="Preview"
                  sandbox="allow-scripts allow-modals"
                />
              )}
              {previewUrl && !error && !htmlSrcdoc && projectType !== 'python' && (
                <iframe
                  src={previewUrl}
                  className="w-full h-full border-0 rounded-xl"
                  title="Preview"
                  sandbox="allow-scripts allow-modals"
                />
              )}
            </>
          )}

          {/* Python projects */}
          {projectType === 'python' && !loading && !error && (
            <div className="absolute inset-0 overflow-y-auto p-4 sm:p-6">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-emerald-500" />
                  <h3 className="text-sm font-medium text-foreground">Python Project</h3>
                </div>
                <div className="wb-card p-3 mb-4 !border-amber-500/30 bg-amber-500/5">
                  <p className="text-xs text-muted-foreground">
                    Python applications require a local server. Download and follow the
                    setup instructions.
                  </p>
                </div>
                {setupMd ? (
                  <div className="wb-card p-4">
                    <div className="text-xs font-mono text-foreground whitespace-pre-wrap leading-relaxed">
                      {setupMd}
                    </div>
                  </div>
                ) : (
                  <div className="wb-card p-4 space-y-2">
                    {Array.from(files.entries()).map(([path]) => (
                      <div
                        key={path}
                        className="flex items-center gap-2 text-xs text-foreground"
                      >
                        <span className="text-muted-foreground">📄</span>
                        {path}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!previewUrl && !htmlSrcdoc && !loading && !error && projectType !== 'python' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div
                  className="h-14 w-14 mx-auto rounded-2xl bg-secondary/40 flex items-center justify-center mb-3"
                  style={{ transform: 'perspective(400px) rotateX(8deg) rotateY(-8deg)' }}
                >
                  <PlayCircle className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Waiting for code generation…
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DeviceFrame({
  children,
  style,
  device,
}: {
  children: React.ReactNode;
  style: React.CSSProperties;
  device: PreviewDevice;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
      className={cn(
        'relative bg-card shadow-2xl overflow-hidden',
        device === 'mobile' && 'rounded-[28px] border-[6px] border-zinc-800/90',
        device === 'tablet' && 'rounded-2xl border-[5px] border-zinc-800/90',
        device !== 'mobile' && device !== 'tablet' && 'rounded-xl border border-border/60',
      )}
      style={style}
    >
      {device === 'mobile' && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-4 w-20 bg-zinc-900 rounded-b-2xl z-10" />
      )}
      {children}
    </motion.div>
  );
}
