'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { collection, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useProjectStore } from '@/lib/store/useProjectStore';
import { doc, getDoc } from 'firebase/firestore';

interface SnapshotItem {
  id: string;
  label: string;
  message: string;
  timestamp: string;
  files: number;
  tokens?: number;
}

export default function ProjectHistoryPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const idToken = useAuthStore((s) => s.idToken);
  const setFiles = useProjectStore((s) => s.setFiles);
  const [snapshots, setSnapshots] = useState<SnapshotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSnapshot, setSelectedSnapshot] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(
          collection(db, 'projects', projectId, 'snapshots'),
          orderBy('timestamp', 'desc'),
          limit(30)
        );
        const snap = await getDocs(q);
        const items: SnapshotItem[] = snap.docs.map((doc, i) => {
          const data = doc.data();
          const ts = (data.timestamp as Timestamp)?.toDate();
          return {
            id: doc.id,
            label: `Snapshot ${snap.docs.length - i}`,
            message: data.triggerMessageId ? `After generation #${i + 1}` : 'Auto-saved',
            timestamp: ts?.toLocaleString() || 'Unknown',
            files: (data.files as any[])?.length || 0,
          };
        });
        setSnapshots(items);
      } catch (err) {
        console.error('Failed to load snapshots:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId]);

  const handleRestore = async (snapshotId: string) => {
    setRestoring(true);
    try {
      const snapDoc = await getDoc(doc(db, 'projects', projectId, 'snapshots', snapshotId));
      if (!snapDoc.exists()) {
        console.error('Snapshot not found');
        return;
      }
      const data = snapDoc.data();
      const fileArray = data.files as { path: string; content: string }[] | undefined;
      if (fileArray) {
        const fileMap = new Map<string, string>();
        fileArray.forEach((f) => fileMap.set(f.path, f.content));
        setFiles(fileMap);
      }
      router.push(`/projects/${projectId}`);
    } catch (err) {
      console.error('Failed to restore:', err);
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Project History</h1>
              <p className="text-sm text-muted-foreground">Browse snapshots and restore previous versions</p>
            </div>
          </div>
        </motion.div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Snapshots</CardTitle>
                <CardDescription>A snapshot is saved after each AI generation</CardDescription>
              </div>
              <Badge variant="secondary">{loading ? '...' : `${snapshots.length} snapshots`}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-sm text-muted-foreground">Loading snapshots...</div>
            ) : snapshots.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No snapshots yet. Generate code to create the first snapshot.
              </div>
            ) : (
              <div className="relative">
                {snapshots.map((snap, i) => (
                  <div key={snap.id} className="relative flex gap-6 pb-8 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-8 w-8 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${
                          selectedSnapshot === snap.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-background hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedSnapshot(snap.id)}
                      >
                        <div className={`h-2.5 w-2.5 rounded-full ${selectedSnapshot === snap.id ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                      </div>
                      {i < snapshots.length - 1 && (
                        <div className="w-[2px] flex-1 bg-border mt-1" />
                      )}
                    </div>
                    <div
                      className={`flex-1 p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedSnapshot === snap.id
                          ? 'border-primary bg-primary/[0.02]'
                          : 'border-border hover:border-border/80 hover:bg-secondary/30'
                      }`}
                      onClick={() => setSelectedSnapshot(snap.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-sm font-medium text-foreground">{snap.label}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{snap.message}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px]">{snap.files} files</Badge>
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{snap.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedSnapshot && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>What would you like to do with this snapshot?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button onClick={() => handleRestore(selectedSnapshot)} disabled={restoring}>
                    {restoring ? 'Restoring...' : 'Restore this snapshot'}
                  </Button>
                  <Button variant="outline" onClick={() => router.push(`/projects/${projectId}`)}>
                    Compare changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
