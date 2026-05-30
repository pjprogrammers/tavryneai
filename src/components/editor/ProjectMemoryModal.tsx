'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { Brain } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectMemoryModal({ open, onOpenChange }: Props) {
  const projectMemory = useEditorStore((s) => s.projectMemory);
  const setProjectMemory = useEditorStore((s) => s.setProjectMemory);
  const [value, setValue] = useState(projectMemory);

  useEffect(() => {
    setValue(projectMemory);
  }, [projectMemory, open]);

  const save = () => {
    setProjectMemory(value);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-[#1e1e2e] border-[#313244] text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-[#cba6f7]" />
            Project Memory
          </DialogTitle>
        </DialogHeader>
        <p className="text-xs text-[#a6adc8]">
          This memory is injected into every AI request. Use it to document architectural decisions, coding conventions, and project context.
        </p>
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={`# Project Memory\n\n## Architecture\n- ...\n\n## Conventions\n- ...`}
          className="min-h-[250px] bg-[#181825] border-[#313244] text-[#cdd6f4] text-sm font-mono"
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-[#a6adc8] hover:text-white hover:bg-[#313244]">
            Cancel
          </Button>
          <Button onClick={save} className="bg-[#cba6f7] text-[#1e1e2e] hover:bg-[#b4befe]">
            Save Memory
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
