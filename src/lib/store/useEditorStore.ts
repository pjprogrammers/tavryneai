import { create } from 'zustand';

export interface FileDiff {
  filename: string;
  oldContent: string;
  newContent: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Checkpoint {
  id: string;
  timestamp: number;
  label: string;
  files: Map<string, string>;
  messages: { role: 'user' | 'assistant'; content: string }[];
  messageId: string;
}

interface EditorState {
  selectedFile: string | null;
  isReadOnly: boolean;
  deviceView: 'desktop' | 'tablet' | 'mobile';
  showPreview: boolean;
  showFileTree: boolean;

  // Shared streaming/diff state
  isStreaming: boolean;
  pendingDiffs: FileDiff[];
  showDiffPanel: boolean;
  currentMessageId: string | null;
  currentProjectId: string | null;
  preAiFiles: Map<string, string> | null;
  postAiFiles: Map<string, string> | null;

  // --- 1. Checkpoint & Rewind ---
  checkpoints: Checkpoint[];
  addCheckpoint: (label: string, files: Map<string, string>, messages: { role: 'user' | 'assistant'; content: string }[], messageId: string) => void;
  restoreCheckpoint: (id: string) => void;
  clearCheckpoints: () => void;

  // --- 2. Plan Mode ---
  planMode: boolean;
  setPlanMode: (mode: boolean) => void;

  // --- 3. Session Sharing ---
  shareDialogOpen: boolean;
  setShareDialogOpen: (open: boolean) => void;
  shareUrl: string | null;
  setShareUrl: (url: string | null) => void;

  // --- 5. Screenshot Input ---
  pendingScreenshots: string[];
  addScreenshot: (dataUrl: string) => void;
  removeScreenshot: (index: number) => void;
  clearScreenshots: () => void;

  // --- 6. Project Memory ---
  projectMemory: string;
  setProjectMemory: (memory: string) => void;

  // --- 10. Custom Instructions ---
  customInstructions: string;
  setCustomInstructions: (instructions: string) => void;

  // --- 11. Visual Editor ---
  visualEditMode: boolean;
  setVisualEditMode: (mode: boolean) => void;

  setSelectedFile: (path: string | null) => void;
  setReadOnly: (readOnly: boolean) => void;
  setDeviceView: (view: 'desktop' | 'tablet' | 'mobile') => void;
  togglePreview: () => void;
  toggleFileTree: () => void;

  // Diff actions
  setStreaming: (streaming: boolean) => void;
  setPendingDiffs: (diffs: FileDiff[], messageId?: string, projectId?: string, preAiFiles?: Map<string, string>, postAiFiles?: Map<string, string>) => void;
  setShowDiffPanel: (show: boolean) => void;
  acceptAllDiffs: () => Promise<void>;
  rejectAllDiffs: () => Promise<void>;
  acceptDiff: (filename: string) => void;
  rejectDiff: (filename: string) => void;

  persistFeedback: (filename: string, status: 'accepted' | 'rejected') => Promise<void>;

  pendingBuildError: string | null;
  triggerAutoFix: (error: string) => void;
  clearAutoFix: () => void;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export const useEditorStore = create<EditorState>((set, get) => ({
  selectedFile: null,
  isReadOnly: true,
  deviceView: 'desktop',
  showPreview: true,
  showFileTree: true,
  isStreaming: false,
  pendingDiffs: [],
  showDiffPanel: false,
  currentMessageId: null,
  currentProjectId: null,
  preAiFiles: null,
  postAiFiles: null,
  pendingBuildError: null,

  // Checkpoints
  checkpoints: [],
  addCheckpoint: (label, files, messages, messageId) => {
    const cp: Checkpoint = {
      id: generateId(),
      timestamp: Date.now(),
      label,
      files: new Map(files),
      messages: messages.map(m => ({ ...m })),
      messageId,
    };
    set((s) => ({ checkpoints: [...s.checkpoints, cp] }));
    try {
      sessionStorage.setItem(`cp-${messageId}`, JSON.stringify({
        files: Array.from(files.entries()),
        messages: messages.map(m => ({ ...m })),
      }));
    } catch {}
  },
  restoreCheckpoint: async (id) => {
    const cp = get().checkpoints.find(c => c.id === id);
    if (!cp) return;
    const { useProjectStore } = await import('@/lib/store/useProjectStore');
    useProjectStore.getState().setFiles(cp.files);
    set({ pendingDiffs: [], showDiffPanel: false });
  },
  clearCheckpoints: () => set({ checkpoints: [] }),

  // Plan Mode
  planMode: false,
  setPlanMode: (mode) => set({ planMode: mode }),

  // Session Sharing
  shareDialogOpen: false,
  setShareDialogOpen: (open) => set({ shareDialogOpen: open }),
  shareUrl: null,
  setShareUrl: (url) => set({ shareUrl: url }),

  // Screenshots
  pendingScreenshots: [],
  addScreenshot: (dataUrl) => set((s) => ({ pendingScreenshots: [...s.pendingScreenshots, dataUrl] })),
  removeScreenshot: (index) => set((s) => ({
    pendingScreenshots: s.pendingScreenshots.filter((_, i) => i !== index)
  })),
  clearScreenshots: () => set({ pendingScreenshots: [] }),

  // Project Memory
  projectMemory: '',
  setProjectMemory: (memory) => set({ projectMemory: memory }),

  // Custom Instructions
  customInstructions: '',
  setCustomInstructions: (instructions) => set({ customInstructions: instructions }),

  // Visual Edit Mode
  visualEditMode: false,
  setVisualEditMode: (mode) => set({ visualEditMode: mode }),

  setSelectedFile: (path) => set({ selectedFile: path }),
  setReadOnly: (readOnly) => set({ isReadOnly: readOnly }),
  setDeviceView: (view) => set({ deviceView: view }),
  togglePreview: () => set((s) => ({ showPreview: !s.showPreview })),
  toggleFileTree: () => set((s) => ({ showFileTree: !s.showFileTree })),

  setStreaming: (streaming) => set({ isStreaming: streaming }),
  setPendingDiffs: (diffs, messageId, projectId, preAiFiles, postAiFiles) => set({ pendingDiffs: diffs, currentMessageId: messageId || null, currentProjectId: projectId || null, preAiFiles: preAiFiles || null, postAiFiles: postAiFiles || null }),
  setShowDiffPanel: (show) => set({ showDiffPanel: show }),
  triggerAutoFix: (error) => set({ pendingBuildError: error }),
  clearAutoFix: () => set({ pendingBuildError: null }),

  persistFeedback: async (filename, status) => {
    const { currentMessageId, currentProjectId } = get();
    if (!currentMessageId || !currentProjectId) return;
    try {
      const authStore = (await import('@/lib/store/useAuthStore')).useAuthStore;
      const idToken = authStore.getState().idToken;
      if (!idToken) return;
      await fetch(`/api/projects/${currentProjectId}/feedback`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageId: currentMessageId, filename, status }),
      });
    } catch {}
  },

  acceptAllDiffs: async () => {
    const { pendingDiffs, postAiFiles } = get();
    for (const diff of pendingDiffs) {
      get().persistFeedback(diff.filename, 'accepted');
    }
    if (postAiFiles) {
      const { useProjectStore } = await import('@/lib/store/useProjectStore');
      useProjectStore.getState().setFiles(postAiFiles);
    }
    set({ pendingDiffs: [], showDiffPanel: false, currentMessageId: null, preAiFiles: null, postAiFiles: null });
  },

  rejectAllDiffs: async () => {
    const { pendingDiffs, preAiFiles } = get();
    for (const diff of pendingDiffs) {
      get().persistFeedback(diff.filename, 'rejected');
    }
    if (preAiFiles) {
      const { useProjectStore } = await import('@/lib/store/useProjectStore');
      useProjectStore.getState().setFiles(preAiFiles);
    }
    set({ pendingDiffs: [], showDiffPanel: false, currentMessageId: null, preAiFiles: null, postAiFiles: null });
  },

  acceptDiff: (filename) => {
    set((state) => {
      const updated = state.pendingDiffs.map((d) =>
        d.filename === filename ? { ...d, status: 'accepted' as const } : d
      );
      const show = !updated.every((d) => d.status !== 'pending');
      return { pendingDiffs: updated, showDiffPanel: show };
    });
    get().persistFeedback(filename, 'accepted');
  },

  rejectDiff: (filename) => {
    set((state) => {
      const updated = state.pendingDiffs.map((d) =>
        d.filename === filename ? { ...d, status: 'rejected' as const } : d
      );
      const show = !updated.every((d) => d.status !== 'pending');
      return { pendingDiffs: updated, showDiffPanel: show };
    });
    get().persistFeedback(filename, 'rejected');
  },
}));
