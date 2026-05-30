'use client';
import { motion } from 'framer-motion';
import { ProjectCard } from './ProjectCard';
import { Project } from '@/lib/types/project';
import { Button } from '@/components/ui/button';

interface ProjectGridProps {
  projects: Project[];
  onCreateProject?: () => void;
}

export function ProjectGrid({ projects, onCreateProject }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
          <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No projects yet</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
          Start by describing your app idea in natural language. TavryneAI will generate production-ready code for you.
        </p>
        <div className="bg-secondary/50 rounded-xl p-4 inline-block text-left mb-6 max-w-sm">
          <p className="text-xs font-medium text-foreground mb-2">Try these prompts:</p>
          <ul className="space-y-1">
            <li className="text-xs text-muted-foreground">&ldquo;Build a landing page for a SaaS product called TaskFlow&rdquo;</li>
            <li className="text-xs text-muted-foreground">&ldquo;Create a todo app with dark mode and local storage&rdquo;</li>
            <li className="text-xs text-muted-foreground">&ldquo;Build a personal portfolio with a blog section&rdquo;</li>
          </ul>
        </div>
        <Button
          onClick={onCreateProject}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Create your first project
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {projects.map((project, i) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
        >
          <ProjectCard project={project} />
        </motion.div>
      ))}
    </div>
  );
}
