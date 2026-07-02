'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Project } from '@/lib/types/project';
import { formatRelativeTime, formatTokenCount } from '@/lib/utils/helpers';
import { Badge } from '@/components/ui/badge';

interface ProjectCardProps {
  project: Project;
}

const frameworkColors: Record<string, string> = {
  nextjs: 'bg-foreground text-background',
  react: 'bg-blue-500 text-white',
  vanilla: 'bg-muted-foreground text-background',
  vue: 'bg-emerald-500 text-white',
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01, y: -2 }}
        className="group relative premium-card p-5 cursor-pointer overflow-hidden"
      >
        {/* Gradient hover effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-primary/[0.02] to-transparent" />

        {/* Thumbnail */}
        <div className="relative w-full h-28 bg-gradient-to-br from-primary/5 via-secondary to-accent/50 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
          {project.thumbnail ? (
            <Image
              src={project.thumbnail}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="text-center">
              <svg className="h-8 w-8 text-muted-foreground/30 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="relative">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {project.title}
            </h3>
            <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${
              frameworkColors[project.framework] || 'bg-secondary text-secondary-foreground'
            }`}>
              {project.framework}
            </span>
          </div>
          {project.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{project.description}</p>
          )}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {formatTokenCount(project.tokenCount)} tokens
            </span>
            <span>{formatRelativeTime(project.updatedAt)}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
