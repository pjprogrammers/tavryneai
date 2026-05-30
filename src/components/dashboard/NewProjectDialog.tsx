'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TEMPLATES, Template } from '@/lib/templates';
import { createProjectViaApi } from '@/lib/api/create-project';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewProjectDialog({ open, onOpenChange }: NewProjectDialogProps) {
  const [name, setName] = useState('');
  const [framework, setFramework] = useState<'nextjs' | 'react' | 'vanilla' | 'vue' | 'python'>('vanilla');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState<'form' | 'templates'>('templates');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setName('');
      setError('');
      setView('templates');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleCreate = async (template?: Template) => {
    const title = template ? template.name : (name.trim() || 'Untitled Project');
    const description = template ? template.description : '';
    const selectedFramework = template ? template.framework : framework;
    setCreating(true);
    setError('');
    try {
      const projectId = await createProjectViaApi(title, description, selectedFramework);

      if (projectId && template) {
        try {
          const now = Timestamp.now();
          await addDoc(collection(db, 'projects', projectId, 'snapshots'), {
            files: template.files,
            triggerMessageId: 'template',
            timestamp: now,
          });
        } catch (err) {
          console.error('Failed to save template snapshot:', err);
        }
      }

      if (projectId) {
        onOpenChange(false);
        router.push(`/projects/${projectId}`);
      } else {
        setError('Failed to create project. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
          <DialogDescription>
            {view === 'templates' ? 'Choose a template to start from, or create a blank project.' : 'Give your project a name.'}
          </DialogDescription>
        </DialogHeader>

        {view === 'templates' ? (
          <div className="space-y-3">
            <button
              onClick={() => setView('form')}
              className="w-full p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-secondary/30 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Blank Project</h3>
                  <p className="text-sm text-muted-foreground">Start with an empty project and build from scratch</p>
                </div>
              </div>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleCreate(template)}
                  disabled={creating}
                  className="p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-secondary/30 transition-all text-left disabled:opacity-50"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </div>
                    <h3 className="font-medium text-foreground">{template.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">{template.description}</p>
                  <p className="text-[10px] text-muted-foreground mt-2">{template.files.length} files</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Input
                ref={inputRef}
                placeholder="e.g. My Awesome App"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={creating}
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Framework</label>
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value as any)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={creating}
              >
                <option value="vanilla">Vanilla HTML/CSS/JS</option>
                <option value="react">React (TypeScript)</option>
                <option value="nextjs">Next.js (App Router)</option>
                <option value="vue">Vue.js</option>
                <option value="python">Python (CLI / Web App)</option>
              </select>
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <div className="flex justify-between gap-3">
              <Button
                variant="ghost"
                onClick={() => setView('templates')}
                disabled={creating}
              >
                ← Back to templates
              </Button>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleCreate()}
                  disabled={creating}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {creating ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    'Create Project'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
