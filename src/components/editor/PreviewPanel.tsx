'use client';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { bundleFiles, buildVanillaPreview, resolveFileContent, revokeBlobUrls, detectProjectType } from '@/lib/bundler/preview';
import { usePanelStore, PreviewDevice, PREVIEW_DEVICE_SIZES } from '@/lib/store/usePanelStore';
import { Monitor, Smartphone, Tablet, Tv, Maximize2, Cog } from 'lucide-react';

interface PreviewPanelProps {
  files: Map<string, string>;
  onFixWithAI?: (error: string) => void;
}

const deviceOptions: { id: PreviewDevice; label: string; icon: typeof Monitor }[] = [
  { id: 'mobile', label: 'Mobile', icon: Smartphone },
  { id: 'tablet', label: 'Tablet', icon: Tablet },
  { id: 'desktop', label: 'Desktop', icon: Monitor },
  { id: 'tv', label: 'TV', icon: Tv },
  { id: 'ultrawide', label: 'Ultrawide', icon: Maximize2 },
  { id: 'custom', label: 'Custom', icon: Cog },
];

export function PreviewPanel({ files, onFixWithAI }: PreviewPanelProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [iframeError, setIframeError] = useState(false);
  const previewUrlRef = useRef<string | null>(null);
  const cancelledRef = useRef(false);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);

  const { previewDevice, setPreviewDevice, customPreviewWidth, customPreviewHeight, setCustomPreviewSize } = usePanelStore();
  const [customW, setCustomW] = useState(customPreviewWidth.toString());
  const [customH, setCustomH] = useState(customPreviewHeight.toString());
  const [showCustomInput, setShowCustomInput] = useState(false);

  const projectInfo = useMemo(() => detectProjectType(files), [files]);
  const projectType = projectInfo.type;

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'preview-error') {
        setRuntimeError(e.data.message);
        setError(`Runtime error: ${e.data.message}`);
        setIframeError(false);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const htmlSrcdoc = useMemo(() => {
    if (projectType !== 'vanilla' || files.size === 0) return null;
    const htmlContent = projectInfo.entryPoint ? files.get(projectInfo.entryPoint) || null : null;
    if (!htmlContent) return null;
    let modified = htmlContent;
    modified = modified.replace(
      /<link\s+[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*\/?>/gi,
      (match, href: string) => {
        const content = resolveFileContent(href, files);
        return content !== null ? `<style>${content}</style>` : match;
      }
    );
    modified = modified.replace(
      /<script\s+[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi,
      (match, src: string) => {
        if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) return match;
        const content = resolveFileContent(src, files);
        return content !== null ? `<script>${content}</script>` : match;
      }
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
    setIframeError(false);
    setRuntimeError(null);

    try {
      const url = await bundleFiles(files, projectInfo.entryPoint || 'index.tsx');
      if (!cancelledRef.current) {
        if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = url;
        setPreviewUrl(url);
      }
    } catch (err: any) {
      if (!cancelledRef.current) {
        setError(err.message || 'Failed to bundle');
      }
    } finally {
      if (!cancelledRef.current) {
        setLoading(false);
      }
    }
  }, [files, projectType, projectInfo.entryPoint]);

  useEffect(() => {
    cancelledRef.current = true;
    revokeBlobUrls();
    const timer = setTimeout(() => { updatePreview(); }, 500);
    return () => {
      cancelledRef.current = true;
      clearTimeout(timer);
    };
  }, [updatePreview]);

  const handleRestart = useCallback(() => {
    setError(null);
    setRuntimeError(null);
    setIframeError(false);
    updatePreview();
  }, [updatePreview]);

  const previewFrameStyle = useMemo(() => {
    if (previewDevice === 'desktop' && !showCustomInput) return {};
    const size = PREVIEW_DEVICE_SIZES[previewDevice];
    if (!size && previewDevice !== 'custom') return {};
    let w: number, h: number;
    if (previewDevice === 'custom' || showCustomInput) {
      w = parseInt(customW) || 1440;
      h = parseInt(customH) || 900;
    } else if (size) {
      w = size.width;
      h = size.height;
    } else {
      return {};
    }
    return {
      width: `${w}px`,
      height: `${h}px`,
      margin: '0 auto',
      transform: 'scale(var(--preview-scale, 1))',
      transformOrigin: 'top center',
    };
  }, [previewDevice, customW, customH, showCustomInput]);

  const handleCustomApply = useCallback(() => {
    const w = parseInt(customW) || 1440;
    const h = parseInt(customH) || 900;
    setCustomPreviewSize(w, h);
    setShowCustomInput(false);
  }, [customW, customH, setCustomPreviewSize]);

  return (
    <div className="relative w-full h-full bg-background flex flex-col">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-card/50">
        <div className="flex items-center gap-2">
          <svg className="h-3.5 w-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="text-[11px] text-muted-foreground font-medium">Preview</span>
          {projectType === 'nextjs' && <span className="text-[10px] text-primary font-medium">Next.js (client-side)</span>}
          {loading && <span className="text-[10px] text-muted-foreground animate-pulse">Bundling...</span>}
        </div>
        <div className="flex items-center gap-0.5">
          {deviceOptions.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                if (id === 'custom') {
                  setShowCustomInput(!showCustomInput);
                } else {
                  setPreviewDevice(id);
                  setShowCustomInput(false);
                }
              }}
              className={`p-1 rounded text-[10px] transition-colors ${
                previewDevice === id && !showCustomInput
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title={label}
            >
              <Icon className="h-3 w-3" />
            </button>
          ))}
          <div className="h-4 w-[1px] bg-border mx-0.5" />
          <button
            onClick={handleRestart}
            className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh preview"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          {previewUrl && (
            <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors" title="Open in new tab">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 002 2v12a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      </div>

      {showCustomInput && (
        <div className="flex items-center gap-1.5 px-3 py-1 bg-secondary/30 border-b border-border/50">
          <input
            value={customW}
            onChange={(e) => setCustomW(e.target.value)}
            placeholder="Width"
            className="w-16 bg-secondary/50 text-xs text-foreground px-1.5 py-0.5 rounded border border-border/50 outline-none"
          />
          <span className="text-xs text-muted-foreground">×</span>
          <input
            value={customH}
            onChange={(e) => setCustomH(e.target.value)}
            placeholder="Height"
            className="w-16 bg-secondary/50 text-xs text-foreground px-1.5 py-0.5 rounded border border-border/50 outline-none"
          />
          <button
            onClick={handleCustomApply}
            className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            Apply
          </button>
        </div>
      )}

      <div className="flex-1 relative overflow-hidden flex items-start justify-center" style={previewDevice !== 'desktop' && !showCustomInput ? { background: 'repeating-conic-gradient(#1a1a2e 0% 25%, transparent 0% 50%) 0 0 / 20px 20px' } : {}}>
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <span className="text-xs text-muted-foreground">Bundling preview...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="absolute inset-0 flex items-center justify-center z-10 p-4">
            <div className="text-center max-w-sm w-full">
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3">
                <svg className="h-5 w-5 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                {runtimeError ? 'Runtime Error' : 'Build error'}
              </p>
              <div className="text-xs text-left text-muted-foreground mb-3 font-mono bg-secondary/50 p-2 rounded max-h-32 overflow-y-auto break-all">
                <code>{error}</code>
              </div>
              <div className="flex items-center justify-center gap-2">
                <button onClick={handleRestart} className="text-xs px-3 py-1.5 rounded border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  Restart
                </button>
                {onFixWithAI && (
                  <button onClick={() => onFixWithAI(error)} className="text-xs px-3 py-1.5 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium">
                    Fix with AI
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {iframeError && !error && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center p-6">
              <p className="text-sm text-muted-foreground mb-3">Preview failed to load</p>
              <button onClick={handleRestart} className="text-sm text-primary hover:text-primary/80 font-medium">
                Restart
              </button>
            </div>
          </div>
        )}

        {previewDevice !== 'desktop' && previewDevice !== 'custom' && PREVIEW_DEVICE_SIZES[previewDevice] && (
          <div style={previewFrameStyle} className="shadow-2xl rounded-lg overflow-hidden border border-border/30 my-2">
            {htmlSrcdoc && !error && !runtimeError && (
              <iframe srcDoc={htmlSrcdoc} className="border-0" style={{ width: previewFrameStyle.width, height: previewFrameStyle.height }} title="Preview" sandbox="allow-scripts allow-modals" />
            )}
            {previewUrl && !error && !htmlSrcdoc && projectType !== 'python' && (
              <iframe src={previewUrl} className="border-0" style={{ width: previewFrameStyle.width, height: previewFrameStyle.height }} title="Preview" sandbox="allow-scripts allow-modals" />
            )}
          </div>
        )}

        {(previewDevice === 'desktop' || !PREVIEW_DEVICE_SIZES[previewDevice]) && (
          <>
            {htmlSrcdoc && !error && !runtimeError && (
              <iframe srcDoc={htmlSrcdoc} className="w-full h-full border-0" title="Preview" sandbox="allow-scripts allow-modals" />
            )}
            {previewUrl && !error && !htmlSrcdoc && projectType !== 'python' && (
              <iframe src={previewUrl} className="w-full h-full border-0" title="Preview" sandbox="allow-scripts allow-modals" />
            )}
          </>
        )}

        {projectType === 'python' && !loading && !error && (
          <div className="absolute inset-0 overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <h3 className="text-sm font-medium text-foreground">Python Project</h3>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4">
                <p className="text-xs text-muted-foreground">
                  Python applications require a local server to run. Download the project and follow the setup instructions below.
                </p>
              </div>
              {setupMd ? (
                <div className="bg-secondary/30 rounded-lg p-4 border border-border">
                  <div className="text-xs font-mono text-foreground whitespace-pre-wrap leading-relaxed">{setupMd}</div>
                </div>
              ) : (
                <div className="bg-secondary/30 rounded-lg p-4 border border-border">
                  <p className="text-xs text-muted-foreground mb-2">Project files:</p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {Array.from(files.entries()).map(([path]) => (
                      <div key={path} className="flex items-center gap-2 text-xs text-foreground">
                        <svg className="h-3 w-3 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {path}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!previewUrl && !htmlSrcdoc && !loading && !error && projectType !== 'python' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <svg className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-xs text-muted-foreground">Waiting for code generation...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}