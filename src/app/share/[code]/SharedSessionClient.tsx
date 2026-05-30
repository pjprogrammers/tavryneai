'use client';
import { useState, useEffect } from 'react';
import { StructuredMessage } from '@/components/chat/StructuredMessage';
import { APP_NAME, APP_URL } from '@/lib/utils/constants';

interface SharedProject {
  id: string;
  title: string;
  description: string;
  framework: string;
  messages: { role: string; content: string; timestamp: string }[];
}

export default function SharedSessionClient({ code }: { code: string }) {
  const [project, setProject] = useState<SharedProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/share/${code}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setProject(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#11111b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#cba6f7]" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#11111b] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-[#cdd6f4] mb-2">Session Not Found</h1>
          <p className="text-sm text-[#a6adc8]">{error || 'This shared session may have been removed or is private.'}</p>
          <a href={APP_URL} className="mt-4 inline-block text-sm text-[#cba6f7] hover:text-[#b4befe]">{APP_NAME} Home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#11111b]">
      <header className="border-b border-[#313244] px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-[#cdd6f4]">{project.title}</h1>
            <p className="text-xs text-[#a6adc8]">{project.description} &middot; {project.framework}</p>
          </div>
          <a href={APP_URL} className="text-xs text-[#cba6f7] hover:text-[#b4befe]">
            Built with {APP_NAME}
          </a>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {project.messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] p-3 rounded-xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-[#cba6f7] text-[#1e1e2e] rounded-br-sm'
                    : 'bg-[#1e1e2e] border border-[#313244] text-[#cdd6f4] rounded-bl-sm'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <StructuredMessage content={msg.content} />
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
