'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useProjectStore } from '@/lib/store/useProjectStore';
import { Rocket } from 'lucide-react';

export function DeployButton() {
  const [deploying, setDeploying] = useState(false);
  const [deployUrl, setDeployUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const idToken = useAuthStore((s) => s.idToken);
  const currentProject = useProjectStore((s) => s.currentProject);
  const updateProject = useProjectStore((s) => s.updateProject);

  const deploy = async () => {
    if (!idToken || !currentProject) return;
    setDeploying(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${currentProject.id}/deploy`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Deployment failed');
      }
      const data = await res.json();
      setDeployUrl(data.url);
      await updateProject(currentProject.id, { deployUrl: data.url });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeploying(false);
    }
  };

  if (deployUrl) {
    return (
      <a
        href={deployUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-[#a6e3a1] hover:text-[#a6e3a1]/80"
      >
        <Rocket className="h-3 w-3" />
        Deployed
      </a>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={deploy}
        disabled={deploying}
        className="text-xs text-[#a6adc8] hover:text-[#cdd6f4] hover:bg-[#313244] h-7"
      >
        <Rocket className="h-3 w-3 mr-1" />
        {deploying ? 'Deploying...' : 'Deploy'}
      </Button>
      {error && <span className="text-[10px] text-red-400">{error}</span>}
    </div>
  );
}
