'use client';
import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

function Avatar({ className, src, alt, fallback, size = 'md', ...props }: AvatarProps) {
  const [error, setError] = React.useState(false);

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full overflow-hidden bg-secondary text-secondary-foreground font-medium shrink-0',
        sizeMap[size],
        className
      )}
      {...props}
    >
      {src && !error ? (
        <Image
          src={src}
          alt={alt || ''}
          fill
          sizes="32px"
          className="object-cover"
          unoptimized
          onError={() => setError(true)}
        />
      ) : (
        <span>{fallback || '?'}</span>
      )}
    </div>
  );
}

export { Avatar };
