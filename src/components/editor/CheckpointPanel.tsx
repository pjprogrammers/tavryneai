'use client';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { Button } from '@/components/ui/button';

export function CheckpointPanel() {
  const checkpoints = useEditorStore((s) => s.checkpoints);
  const restoreCheckpoint = useEditorStore((s) => s.restoreCheckpoint);

  if (checkpoints.length === 0) return null;

  return (
    <div className="border-b border-[#313244] bg-[#1e1e2e] px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-[#a6adc8]">Rewind</span>
        <div className="flex gap-1 overflow-x-auto">
          {checkpoints.map((cp, i) => (
            <Button
              key={cp.id}
              variant="ghost"
              size="sm"
              onClick={() => restoreCheckpoint(cp.id)}
              className="text-xs text-[#cdd6f4] hover:bg-[#313244] shrink-0"
              title={cp.label}
            >
              #{i + 1}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
