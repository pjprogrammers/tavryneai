import { create } from 'zustand';
import { Project, ProjectMessage, FileSnapshot } from '@/lib/types/project';
import { db } from '@/lib/firebase/client';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  messages: ProjectMessage[];
  files: Map<string, string>;
  loading: boolean;

  loadProjects: (userId: string) => Promise<void>;
  loadProject: (projectId: string) => Promise<void>;
  createProject: (data: Partial<Project>) => Promise<string | null>;
  updateProject: (projectId: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  archiveProject: (projectId: string) => Promise<void>;
  loadMessages: (projectId: string) => Promise<void>;
  addMessage: (projectId: string, message: Omit<ProjectMessage, 'id'>) => Promise<string>;
  loadSnapshot: (projectId: string) => Promise<void>;
  saveSnapshot: (projectId: string, files: FileSnapshot[], triggerMessageId: string) => Promise<void>;
  updateFile: (path: string, content: string) => void;
  setFiles: (files: Map<string, string>) => void;
  addFile: (path: string, content?: string) => void;
  renameFile: (oldPath: string, newPath: string) => void;
  deleteFile: (path: string) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  messages: [],
  files: new Map<string, string>(),
  loading: false,

  loadProjects: async (userId: string) => {
    set({ loading: true });
    try {
      const now = new Date();
      const q = query(
        collection(db, 'projects'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const projects = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          const createdAt = (data.createdAt as Timestamp)?.toDate();
          const updatedAt = (data.updatedAt as Timestamp)?.toDate();
          const expiresAt = (data.expiresAt as Timestamp)?.toDate();
          return {
            id: doc.id,
            userId: data.userId || '',
            title: data.title || 'Untitled',
            description: data.description || '',
            createdAt: createdAt || now,
            updatedAt: updatedAt || createdAt || now,
            status: data.status || 'active',
            framework: data.framework || 'nextjs',
            selectedModel: data.selectedModel || '',
            tokenCount: data.tokenCount || 0,
            deployUrl: data.deployUrl || null,
            githubRepo: data.githubRepo || null,
            isPublic: data.isPublic ?? false,
            thumbnail: data.thumbnail || null,
            expiresAt,
          } as Project;
        })
        .filter((p) => {
          if (!p.expiresAt) return true;
          return p.expiresAt > now;
        })
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      set({ projects, loading: false });
    } catch (err) {
      console.error('[ProjectStore] loadProjects failed:', err);
      set({ loading: false, projects: [] });
    }
  },

  loadProject: async (projectId: string) => {
    set({ loading: true });
    try {
      const docRef = doc(db, 'projects', projectId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const now = new Date();
        const createdAt = (data.createdAt as Timestamp)?.toDate();
        const updatedAt = (data.updatedAt as Timestamp)?.toDate();
        const expiresAt = (data.expiresAt as Timestamp)?.toDate();
        if (expiresAt && expiresAt < now) {
          await updateDoc(docRef, { status: 'deleted', updatedAt: Timestamp.now() }).catch(() => {});
          set({ loading: false, currentProject: null });
          return;
        }
        set({
          currentProject: {
            id: docSnap.id,
            userId: data.userId || '',
            title: data.title || 'Untitled',
            description: data.description || '',
            createdAt: createdAt || now,
            updatedAt: updatedAt || createdAt || now,
            status: data.status || 'active',
            framework: data.framework || 'nextjs',
            selectedModel: data.selectedModel || '',
            tokenCount: data.tokenCount || 0,
            deployUrl: data.deployUrl || null,
            githubRepo: data.githubRepo || null,
            isPublic: data.isPublic ?? false,
            thumbnail: data.thumbnail || null,
            expiresAt,
          } as Project,
          loading: false,
        });
        await get().loadMessages(projectId);
        await get().loadSnapshot(projectId);
        // Also extract files from messages that have the files field
        const { messages } = get();
        const fileMap = new Map<string, string>();
        for (const msg of messages) {
          if (msg.files && Array.isArray(msg.files)) {
            for (const f of msg.files) {
              fileMap.set(f.path, f.content);
            }
          }
        }
        if (fileMap.size > 0) {
          set({ files: fileMap });
        }
      } else {
        set({ loading: false, currentProject: null });
      }
    } catch (err) {
      console.error('[ProjectStore] loadProject failed:', err);
      set({ loading: false, currentProject: null });
    }
  },

  createProject: async (data: Partial<Project>) => {
    try {
      const { useAuthStore: AuthStore } = await import('@/lib/store/useAuthStore');
      const idToken = AuthStore.getState().idToken;
      if (!idToken) return null;
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
        body: JSON.stringify({ title: data.title, description: data.description, framework: data.framework }),
      });
      if (!res.ok) return null;
      const project = await res.json();
      return project.id;
    } catch {
      return null;
    }
  },

  updateProject: async (projectId: string, data: Partial<Project>) => {
    const docRef = doc(db, 'projects', projectId);
    await updateDoc(docRef, { ...data, updatedAt: Timestamp.now() });
    const current = get().currentProject;
    if (current?.id === projectId) {
      set({ currentProject: { ...current, ...data, updatedAt: new Date() } });
    }
  },

  deleteProject: async (projectId: string) => {
    const docRef = doc(db, 'projects', projectId);
    await updateDoc(docRef, { status: 'deleted', updatedAt: Timestamp.now() });
  },

  archiveProject: async (projectId: string) => {
    const docRef = doc(db, 'projects', projectId);
    await updateDoc(docRef, { status: 'archived', updatedAt: Timestamp.now() });
  },

  loadMessages: async (projectId: string) => {
    const q = query(
      collection(db, 'projects', projectId, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(100)
    );
    const snapshot = await getDocs(q);
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: (doc.data().timestamp as Timestamp)?.toDate(),
    })) as ProjectMessage[];
    set({ messages });
  },

  addMessage: async (projectId: string, message: Omit<ProjectMessage, 'id'>) => {
    const docRef = await addDoc(collection(db, 'projects', projectId, 'messages'), {
      ...message,
      timestamp: Timestamp.now(),
    });
    const newMessage = { ...message, id: docRef.id } as ProjectMessage;
    set((state) => ({ messages: [...state.messages, newMessage] }));
    return docRef.id;
  },

  loadSnapshot: async (projectId: string) => {
    const q = query(
      collection(db, 'projects', projectId, 'snapshots'),
      orderBy('timestamp', 'desc'),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();
      const fileArray = data.files as FileSnapshot[] | undefined;
      if (fileArray) {
        const fileMap = new Map<string, string>();
        fileArray.forEach((f) => fileMap.set(f.path, f.content));
        set({ files: fileMap });
      }
    }
  },

  saveSnapshot: async (projectId: string, files: FileSnapshot[], triggerMessageId: string) => {
    await addDoc(collection(db, 'projects', projectId, 'snapshots'), {
      files,
      triggerMessageId,
      timestamp: Timestamp.now(),
    });
  },

  updateFile: (path: string, content: string) => {
    const newFiles = new Map(get().files);
    newFiles.set(path, content);
    set({ files: newFiles });
  },

  setFiles: (files: Map<string, string>) => {
    set({ files });
  },

  addFile: (path: string, content: string = '') => {
    const newFiles = new Map(get().files);
    newFiles.set(path, content);
    set({ files: newFiles });
  },

  renameFile: (oldPath: string, newPath: string) => {
    const newFiles = new Map(get().files);
    const content = newFiles.get(oldPath);
    if (content !== undefined) {
      newFiles.delete(oldPath);
      newFiles.set(newPath, content);
      set({ files: newFiles });
    }
  },

  deleteFile: (path: string) => {
    const newFiles = new Map(get().files);
    newFiles.delete(path);
    set({ files: newFiles });
  },
}));
