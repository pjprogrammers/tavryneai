'use client';
import { useEditorStore, FileDiff } from '@/lib/store/useEditorStore';
import { Button } from '@/components/ui/button';
import { Check, X, FileCode } from 'lucide-react';

export function DiffPanel() {
  const pendingDiffs = useEditorStore((s) => s.pendingDiffs);
  const showDiffPanel = useEditorStore((s) => s.showDiffPanel);
  const acceptAllDiffs = useEditorStore((s) => s.acceptAllDiffs);
  const rejectAllDiffs = useEditorStore((s) => s.rejectAllDiffs);
  const acceptDiff = useEditorStore((s) => s.acceptDiff);
  const rejectDiff = useEditorStore((s) => s.rejectDiff);

  if (!showDiffPanel || pendingDiffs.length === 0) return null;

  return (
    <div className="border-t border-[#313244] bg-[#11111b]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#313244]">
        <span className="text-xs font-medium text-[#a6adc8]">
          {pendingDiffs.filter((d) => d.status === 'pending').length} pending changes
        </span>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={rejectAllDiffs}
            className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7"
          >
            <X className="h-3 w-3 mr-1" />
            Reject All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={acceptAllDiffs}
            className="text-xs text-[#a6e3a1] hover:text-[#a6e3a1] hover:bg-green-500/10 h-7"
          >
            <Check className="h-3 w-3 mr-1" />
            Accept All
          </Button>
        </div>
      </div>
      <div className="max-h-48 overflow-y-auto">
        {pendingDiffs.map((diff) => (
          <DiffRow key={diff.filename} diff={diff} onAccept={acceptDiff} onReject={rejectDiff} />
        ))}
      </div>
    </div>
  );
}

function DiffRow({ diff, onAccept, onReject }: { diff: FileDiff; onAccept: (f: string) => void; onReject: (f: string) => void }) {
  const isPending = diff.status === 'pending';
  const isAccepted = diff.status === 'accepted';
  const isDeleted = diff.newContent === '' && diff.oldContent !== '';

  return (
    <div className={`flex items-center justify-between px-3 py-1.5 border-b border-[#313244]/50 ${isAccepted ? 'bg-green-500/5' : ''}`}>
      <div className="flex items-center gap-2 min-w-0">
        <FileCode className="h-3 w-3 shrink-0 text-[#a6adc8]" />
        <span className="text-xs text-[#cdd6f4] truncate">{diff.filename}</span>
        <span className={`text-[10px] px-1 rounded ${
          isDeleted ? 'bg-red-500/10 text-red-400' :
          diff.oldContent ? 'bg-[#f9e2af]/10 text-[#f9e2af]' :
          'bg-[#a6e3a1]/10 text-[#a6e3a1]'
        }`}>
          {isDeleted ? 'delete' : diff.oldContent ? 'modify' : 'create'}
        </span>
      </div>
      {isPending && (
        <div className="flex gap-1 shrink-0">
          <button onClick={() => onReject(diff.filename)} className="h-5 w-5 flex items-center justify-center rounded hover:bg-red-500/10">
            <X className="h-3 w-3 text-red-400" />
          </button>
          <button onClick={() => onAccept(diff.filename)} className="h-5 w-5 flex items-center justify-center rounded hover:bg-green-500/10">
            <Check className="h-3 w-3 text-[#a6e3a1]" />
          </button>
        </div>
      )}
      {isAccepted && (
        <Check className="h-3 w-3 text-[#a6e3a1] shrink-0" />
      )}
    </div>
  );
}
