'use client';
import { useCallback, useRef } from 'react';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';

export function ScreenshotInput() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addScreenshot = useEditorStore((s) => s.addScreenshot);
  const pendingScreenshots = useEditorStore((s) => s.pendingScreenshots);
  const removeScreenshot = useEditorStore((s) => s.removeScreenshot);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        addScreenshot(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [addScreenshot]);

  return (
    <div className="flex items-center gap-1">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        className="h-7 w-7 text-[#a6adc8] hover:text-[#cdd6f4] hover:bg-[#313244]"
        title="Attach screenshot"
      >
        <Camera className="h-3.5 w-3.5" />
      </Button>
      {pendingScreenshots.length > 0 && (
        <div className="flex items-center gap-1">
          {pendingScreenshots.map((s, i) => (
            <div key={i} className="relative group">
              <img src={s} alt={`Screenshot ${i + 1}`} className="h-7 w-7 object-cover rounded border border-[#313244]" />
              <button
                onClick={() => removeScreenshot(i)}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-3.5 h-3.5 text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100"
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
