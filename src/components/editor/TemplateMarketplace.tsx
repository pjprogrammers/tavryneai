'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { createProjectViaApi } from '@/lib/api/create-project';

const TEMPLATES = [
  {
    id: 'nextjs-blog',
    name: 'Next.js Blog',
    description: 'A markdown-based blog with MDX support, tags, and RSS feed.',
    framework: 'nextjs' as const,
    icon: '📝',
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce Starter',
    description: 'Product catalog, cart, checkout with Stripe integration.',
    framework: 'nextjs' as const,
    icon: '🛒',
  },
  {
    id: 'saas-dashboard',
    name: 'SaaS Dashboard',
    description: 'Admin dashboard with charts, auth, and team management.',
    framework: 'nextjs' as const,
    icon: '📊',
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'Personal portfolio with dark/light mode and animations.',
    framework: 'nextjs' as const,
    icon: '🎨',
  },
  {
    id: 'ai-chat',
    name: 'AI Chat App',
    description: 'Chat interface with streaming responses and tool calls.',
    framework: 'nextjs' as const,
    icon: '🤖',
  },
  {
    id: 'landing-page',
    name: 'Landing Page',
    description: 'Marketing landing page with sections and contact form.',
    framework: 'nextjs' as const,
    icon: '🚀',
  },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TemplateMarketplace({ open, onOpenChange }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const idToken = useAuthStore((s) => s.idToken);
  const router = useRouter();

  const handleUseTemplate = async (template: typeof TEMPLATES[0]) => {
    if (!idToken) return;
    setLoading(template.id);
    try {
      const projectId = await createProjectViaApi(
        `[Template] ${template.name}`,
        template.description,
        template.framework,
      );
      if (projectId) {
        router.push(`/projects/${projectId}`);
      }
    } catch {} finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-[#1e1e2e] border-[#313244] text-white max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Template Marketplace</DialogTitle>
          <DialogDescription className="text-[#a6adc8]">
            Start from a pre-built template to kickstart your project.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          {TEMPLATES.map((t) => (
            <Button
              key={t.id}
              variant="outline"
              onClick={() => handleUseTemplate(t)}
              disabled={loading !== null}
              className="flex flex-col items-start gap-1 p-4 h-auto bg-[#181825] border-[#313244] hover:border-[#cba6f7] hover:bg-[#1e1e2e] text-left"
            >
              <span className="text-2xl">{t.icon}</span>
              <span className="font-medium text-sm text-[#cdd6f4]">{t.name}</span>
              <span className="text-xs text-[#a6adc8]">{t.description}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
