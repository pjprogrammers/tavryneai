'use client';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useProjectStore } from '@/lib/store/useProjectStore';
import { ProjectWorkbench } from '@/components/workbench/ProjectWorkbench';
import { LoadingState } from '@/components/shared/loading-state';

export default function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const loadProject = useProjectStore((s) => s.loadProject);
  const files = useProjectStore((s) => s.files);
  const updateFile = useProjectStore((s) => s.updateFile);
  const currentProject = useProjectStore((s) => s.currentProject);
  const loading = useProjectStore((s) => s.loading);

  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId, loadProject]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <LoadingState type="editor" />
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Project not found</h3>
          <p className="text-sm text-muted-foreground">This project doesn&apos;t exist or you don&apos;t have access.</p>
        </div>
      </div>
    );
  }

  return (
    <ProjectWorkbench
      files={files}
      onFileUpdate={updateFile}
      project={currentProject}
      projectId={projectId}
    />
  );
}
