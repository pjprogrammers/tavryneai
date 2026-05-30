'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

export default function ProjectDeployPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const idToken = useAuthStore((s) => s.idToken);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [exportUrl, setExportUrl] = useState('');

  const handleExport = async () => {
    if (!idToken) return;
    setExporting(true);

    // Log deployment started
    fetch(`/api/projects/${projectId}/deployments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'export', status: 'started' }),
    }).catch(() => {});

    try {
      const res = await fetch(`/api/projects/${projectId}/export`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) throw new Error('Export failed');
      const data = await res.json();

      // Create a downloadable JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      setExportUrl(url);
      setExported(true);

      // Log deployment completed
      fetch(`/api/projects/${projectId}/deployments`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'export', status: 'completed' }),
      }).catch(() => {});
    } catch (err: any) {
      console.error('Export error:', err);

      // Log deployment failed
      fetch(`/api/projects/${projectId}/deployments`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'export', status: 'failed', metadata: { error: err.message } }),
      }).catch(() => {});
    } finally {
      setExporting(false);
    }
  };

  const handleDeployVercel = () => {
    // Open Vercel's deploy flow with instructions
    window.open('https://vercel.com/new', '_blank');
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Deployment</h1>
              <p className="text-sm text-muted-foreground">Export your project and deploy to Vercel</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Export Project</CardTitle>
              <CardDescription>Download your project as a JSON export</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Export all project files and metadata. Import into any Next.js project or deploy to Vercel.
              </p>
              <Separator />
              {exported && exportUrl ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">Export ready!</p>
                    <p className="text-xs text-green-600 dark:text-green-400/80 mt-1">
                      Download the export and import it into your Vercel project.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={exportUrl}
                      download={`project-${projectId}.json`}
                      className="flex-1"
                    >
                      <Button className="w-full">Download Export</Button>
                    </a>
                    <Button variant="outline" onClick={() => { setExported(false); setExportUrl(''); }}>
                      Reset
                    </Button>
                  </div>
                </div>
              ) : (
                <Button onClick={handleExport} disabled={exporting} className="w-full">
                  {exporting ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Exporting...
                    </span>
                  ) : (
                    'Export Project'
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deploy to Vercel</CardTitle>
              <CardDescription>One-click deployment to Vercel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">Project name</Label>
                <Input id="project-name" defaultValue="my-tavryne-project" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="framework">Framework</Label>
                <Input id="framework" defaultValue="Next.js" disabled />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Auto-deploy on changes</p>
                  <p className="text-xs text-muted-foreground">Coming soon with GitHub integration</p>
                </div>
                <Switch checked={false} onCheckedChange={() => {}} disabled />
              </div>
              <Separator />
              <p className="text-xs text-muted-foreground">
                Export your project first, then import the files into a new Vercel project.
              </p>
              <Button onClick={handleDeployVercel} variant="outline" className="w-full">
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 22 22 2 22" />
                </svg>
                Open Vercel
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Deployment Instructions</CardTitle>
            <CardDescription>How to deploy your project</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside">
              <li>Click <strong>Export Project</strong> to download your project files</li>
              <li>Create a new repository on GitHub and push the exported files</li>
              <li>Go to <strong>Vercel</strong> and import your GitHub repository</li>
              <li>Vercel will auto-detect Next.js and deploy your project</li>
              <li>Your app will be live at a vercel.app domain</li>
            </ol>
            <Separator className="my-4" />
            <p className="text-xs text-muted-foreground">
              GitHub sync and one-click deploy coming soon. Your code is yours — export anytime.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
