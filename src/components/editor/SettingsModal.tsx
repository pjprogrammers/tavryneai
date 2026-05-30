'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { useProjectStore } from '@/lib/store/useProjectStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { APP_NAME } from '@/lib/utils/constants';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: Props) {
  const customInstructions = useEditorStore((s) => s.customInstructions);
  const setCustomInstructions = useEditorStore((s) => s.setCustomInstructions);
  const projectMemory = useEditorStore((s) => s.projectMemory);
  const setProjectMemory = useEditorStore((s) => s.setProjectMemory);
  const currentProject = useProjectStore((s) => s.currentProject);
  const updateProject = useProjectStore((s) => s.updateProject);
  const idToken = useAuthStore((s) => s.idToken);

  const [instructions, setInstructions] = useState(customInstructions);
  const [memory, setMemory] = useState(projectMemory);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setInstructions(customInstructions);
    setMemory(projectMemory);
  }, [customInstructions, projectMemory, open]);

  const save = async () => {
    setSaving(true);
    setCustomInstructions(instructions);
    setProjectMemory(memory);
    if (currentProject && idToken) {
      await updateProject(currentProject.id, {
        customInstructions: instructions,
        projectMemory: memory,
      });
    }
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-[#1e1e2e] border-[#313244] text-white">
        <DialogHeader>
          <DialogTitle>Project Settings</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="instructions" className="text-sm text-[#cdd6f4]">
              Custom Instructions
            </Label>
            <p className="text-xs text-[#a6adc8]">
              These instructions are injected into the system prompt for every AI request.
            </p>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g., Always use TypeScript, prefer functional components, use Tailwind CSS..."
              className="min-h-[100px] bg-[#181825] border-[#313244] text-[#cdd6f4] text-sm"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="memory" className="text-sm text-[#cdd6f4]">
              Project Memory (MEMORY.md)
            </Label>
            <p className="text-xs text-[#a6adc8]">
              Persistent context that stays across sessions. Useful for architectural decisions and conventions.
            </p>
            <Textarea
              id="memory"
              value={memory}
              onChange={(e) => setMemory(e.target.value)}
              placeholder="# Project Memory

Key architectural decisions:
- Using Zustand for state management
- Firebase for auth and database
- ..."
              className="min-h-[150px] bg-[#181825] border-[#313244] text-[#cdd6f4] text-sm font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-[#a6adc8] hover:text-white hover:bg-[#313244]"
            >
              Cancel
            </Button>
            <Button
              onClick={save}
              disabled={saving}
              className="bg-[#cba6f7] text-[#1e1e2e] hover:bg-[#b4befe]"
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
