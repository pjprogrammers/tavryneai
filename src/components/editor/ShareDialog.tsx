'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useProjectStore } from '@/lib/store/useProjectStore';
import { APP_URL } from '@/lib/utils/constants';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareDialog({ open, onOpenChange }: Props) {
  const [copying, setCopying] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const idToken = useAuthStore((s) => s.idToken);
  const currentProject = useProjectStore((s) => s.currentProject);

  const generateShareLink = async () => {
    if (!idToken || !currentProject) return;
    try {
      const res = await fetch(`/api/projects/${currentProject.id}/share`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) throw new Error('Failed to generate share link');
      const data = await res.json();
      const url = `${APP_URL}/share/${data.shareCode}`;
      setShareUrl(url);
    } catch {}
  };

  const copyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopying(true);
      setTimeout(() => setCopying(false), 2000);
    } catch {}
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#1e1e2e] border-[#313244] text-white">
        <DialogHeader>
          <DialogTitle>Share Session</DialogTitle>
          <DialogDescription className="text-[#a6adc8]">
            Generate a shareable link to this project&apos;s current state.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {!shareUrl ? (
            <Button onClick={generateShareLink} className="bg-[#cba6f7] text-[#1e1e2e] hover:bg-[#b4befe]">
              Generate Share Link
            </Button>
          ) : (
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly className="font-mono text-sm bg-[#181825] border-[#313244] text-white" />
              <Button onClick={copyLink} className="shrink-0 bg-[#cba6f7] text-[#1e1e2e] hover:bg-[#b4befe]">
                {copying ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
