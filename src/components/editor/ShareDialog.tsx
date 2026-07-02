'use client';
import { useState, useEffect } from 'react';
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
  const [revoking, setRevoking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const idToken = useAuthStore((s) => s.idToken);
  const currentProject = useProjectStore((s) => s.currentProject);

  useEffect(() => {
    if (!open) {
      setError(null);
      setShareUrl(null);
    }
  }, [open]);

  const generateShareLink = async () => {
    if (!idToken || !currentProject) return;
    setError(null);
    try {
      const res = await fetch(`/api/projects/${currentProject.id}/share`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) throw new Error('Failed to generate share link');
      const data = await res.json();
      const url = `${APP_URL}/share/${data.shareCode}`;
      setShareUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate share link');
    }
  };

  const revokeShareLink = async () => {
    if (!idToken || !currentProject) return;
    setRevoking(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${currentProject.id}/share`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) throw new Error('Failed to revoke share link');
      setShareUrl(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke share link');
    } finally {
      setRevoking(false);
    }
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
    <Dialog open={open} onOpenChange={onOpenChange} ariaLabel="Share session">
      <DialogContent className="sm:max-w-md bg-[#1e1e2e] border-[#313244] text-white">
        <DialogHeader>
          <DialogTitle>Share Session</DialogTitle>
          <DialogDescription className="text-[#a6adc8]">
            Generate a shareable link to this project&apos;s current state.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {error && (
            <div
              role="alert"
              className="p-2.5 rounded-md bg-red-500/10 border border-red-500/30 text-red-300 text-sm"
            >
              {error}
            </div>
          )}
          {!shareUrl ? (
            <Button
              onClick={generateShareLink}
              className="bg-[#cba6f7] text-[#1e1e2e] hover:bg-[#b4befe]"
              aria-label="Generate shareable link"
            >
              Generate Share Link
            </Button>
          ) : (
            <>
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  aria-label="Shareable link"
                  className="font-mono text-sm bg-[#181825] border-[#313244] text-white"
                />
                <Button
                  onClick={copyLink}
                  className="shrink-0 bg-[#cba6f7] text-[#1e1e2e] hover:bg-[#b4befe]"
                  aria-label={copying ? 'Link copied to clipboard' : 'Copy share link to clipboard'}
                >
                  {copying ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <Button
                onClick={revokeShareLink}
                disabled={revoking}
                variant="outline"
                className="bg-transparent border-red-500/40 text-red-300 hover:bg-red-500/10"
                aria-label="Revoke share link"
              >
                {revoking ? 'Revoking…' : 'Revoke Share Link'}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
