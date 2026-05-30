'use client';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { Switch } from '@/components/ui/switch';
import { MousePointerClick } from 'lucide-react';

export function VisualEditPanel() {
  const visualEditMode = useEditorStore((s) => s.visualEditMode);
  const setVisualEditMode = useEditorStore((s) => s.setVisualEditMode);
  const selectedFile = useEditorStore((s) => s.selectedFile);

  const isCodeFile = selectedFile && /\.(tsx|jsx|html)$/.test(selectedFile);

  if (!isCodeFile) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 border-t border-[#313244]">
      <MousePointerClick className="h-3 w-3 text-[#a6adc8]" />
      <Switch
        checked={visualEditMode}
        onCheckedChange={setVisualEditMode}
        id="visual-edit"
        className="data-[state=checked]:bg-[#f9e2af] scale-75"
      />
      <label htmlFor="visual-edit" className="text-xs text-[#a6adc8] cursor-pointer select-none">
        Click-to-Edit
      </label>
    </div>
  );
}
