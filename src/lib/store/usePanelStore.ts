import { create } from 'zustand';

export type DeviceBreakpoint = 'mobile' | 'tablet' | 'laptop' | 'desktop' | 'ultrawide' | 'tv';

export const BREAKPOINTS: Record<DeviceBreakpoint, number> = {
  mobile: 768,
  tablet: 1024,
  laptop: 1440,
  desktop: 2560,
  ultrawide: 3840,
  tv: Infinity,
};

export function detectBreakpoint(width: number): DeviceBreakpoint {
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  if (width < 1440) return 'laptop';
  if (width < 2560) return 'desktop';
  if (width < 3840) return 'ultrawide';
  return 'tv';
}

export interface PanelState {
  id: string;
  visible: boolean;
  width: number;
  height: number;
  docked: boolean;
  order: number;
}

export type PreviewDevice = 'mobile' | 'tablet' | 'desktop' | 'tv' | 'ultrawide' | 'custom';

export const PREVIEW_DEVICE_SIZES: Record<PreviewDevice, { width: number; height: number } | null> = {
  mobile: { width: 375, height: 812 },
  tablet: { width: 768, height: 1024 },
  desktop: null,
  tv: { width: 1920, height: 1080 },
  ultrawide: { width: 2560, height: 1080 },
  custom: { width: 1440, height: 900 },
};

export type BottomTab = 'terminal' | 'logs' | 'changes' | 'console';

interface PanelStore {
  breakpoint: DeviceBreakpoint;
  chatVisible: boolean;
  filesVisible: boolean;
  previewVisible: boolean;
  chatWidth: number;
  filesWidth: number;
  previewWidth: number;
  bottomTab: BottomTab;
  bottomOpen: boolean;
  bottomHeight: number;
  previewDevice: PreviewDevice;
  customPreviewWidth: number;
  customPreviewHeight: number;
  recentFiles: string[];
  showAgentTimeline: boolean;

  setBreakpoint: (bp: DeviceBreakpoint) => void;
  toggleChat: () => void;
  toggleFiles: () => void;
  togglePreview: () => void;
  setChatVisible: (v: boolean) => void;
  setFilesVisible: (v: boolean) => void;
  setPreviewVisible: (v: boolean) => void;
  setChatWidth: (w: number) => void;
  setFilesWidth: (w: number) => void;
  setPreviewWidth: (w: number) => void;
  setBottomTab: (tab: BottomTab) => void;
  setBottomOpen: (open: boolean) => void;
  setBottomHeight: (h: number) => void;
  setPreviewDevice: (d: PreviewDevice) => void;
  setCustomPreviewSize: (w: number, h: number) => void;
  addRecentFile: (path: string) => void;
  setShowAgentTimeline: (show: boolean) => void;
  resetLayout: () => void;
}

const STORAGE_KEY = 'tavryne-panel-layout';

function loadPersisted(): Partial<PanelStore> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function persist(state: Partial<PanelStore>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

const defaults = {
  breakpoint: 'desktop' as DeviceBreakpoint,
  chatVisible: true,
  filesVisible: true,
  previewVisible: true,
  chatWidth: 400,
  filesWidth: 260,
  previewWidth: 450,
  bottomTab: 'terminal' as BottomTab,
  bottomOpen: false,
  bottomHeight: 200,
  previewDevice: 'desktop' as PreviewDevice,
  customPreviewWidth: 1440,
  customPreviewHeight: 900,
  recentFiles: [] as string[],
  showAgentTimeline: true,
};

export const usePanelStore = create<PanelStore>((set, get) => {
  const persisted = loadPersisted();
  return {
    ...defaults,
    ...persisted,

    setBreakpoint: (bp) => set({ breakpoint: bp }),
    toggleChat: () => {
      const next = !get().chatVisible;
      set({ chatVisible: next });
      persist({ chatVisible: next });
    },
    toggleFiles: () => {
      const next = !get().filesVisible;
      set({ filesVisible: next });
      persist({ filesVisible: next });
    },
    togglePreview: () => {
      const next = !get().previewVisible;
      set({ previewVisible: next });
      persist({ previewVisible: next });
    },
    setChatVisible: (v) => { set({ chatVisible: v }); persist({ chatVisible: v }); },
    setFilesVisible: (v) => { set({ filesVisible: v }); persist({ filesVisible: v }); },
    setPreviewVisible: (v) => { set({ previewVisible: v }); persist({ previewVisible: v }); },
    setChatWidth: (w) => { set({ chatWidth: w }); persist({ chatWidth: w }); },
    setFilesWidth: (w) => { set({ filesWidth: w }); persist({ filesWidth: w }); },
    setPreviewWidth: (w) => { set({ previewWidth: w }); persist({ previewWidth: w }); },
    setBottomTab: (tab) => { set({ bottomTab: tab }); persist({ bottomTab: tab }); },
    setBottomOpen: (open) => { set({ bottomOpen: open }); persist({ bottomOpen: open }); },
    setBottomHeight: (h) => { set({ bottomHeight: h }); persist({ bottomHeight: h }); },
    setPreviewDevice: (d) => { set({ previewDevice: d }); persist({ previewDevice: d }); },
    setCustomPreviewSize: (w, h) => { set({ customPreviewWidth: w, customPreviewHeight: h }); persist({ customPreviewWidth: w, customPreviewHeight: h }); },
    addRecentFile: (path) => {
      const recent = get().recentFiles.filter((f) => f !== path);
      recent.unshift(path);
      if (recent.length > 10) recent.length = 10;
      set({ recentFiles: recent });
      persist({ recentFiles: recent });
    },
    setShowAgentTimeline: (show) => set({ showAgentTimeline: show }),
    resetLayout: () => {
      set(defaults);
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
    },
  };
});
