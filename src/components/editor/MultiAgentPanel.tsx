'use client';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useProjectStore } from '@/lib/store/useProjectStore';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { Layers, X, Check, Loader2 } from 'lucide-react';

interface AgentResult {
  index: number;
  label: string;
  content: string;
  status: 'pending' | 'streaming' | 'done' | 'error';
  error?: string;
}

export function MultiAgentPanel() {
  const [expanded, setExpanded] = useState(false);
  const [prompts, setPrompts] = useState<string[]>([
    'Review the codebase and identify issues',
    'Suggest performance improvements',
    'Generate unit tests',
  ]);
  const [results, setResults] = useState<AgentResult[]>([]);
  const [running, setRunning] = useState(false);
  const idToken = useAuthStore((s) => s.idToken);
  const currentProject = useProjectStore((s) => s.currentProject);
  const messages = useProjectStore((s) => s.messages);
  const files = useProjectStore((s) => s.files);
  const addMessage = useProjectStore((s) => s.addMessage);

  const updatePrompt = (i: number, val: string) => {
    setPrompts((prev) => prev.map((p, j) => j === i ? val : p));
  };

  const addPrompt = () => setPrompts((prev) => [...prev, '']);
  const removePrompt = (i: number) => setPrompts((prev) => prev.filter((_, j) => j !== i));

  const runAgents = useCallback(async () => {
    if (!idToken || !currentProject || running) return;
    setRunning(true);
    const validPrompts = prompts.filter((p) => p.trim());
    const agentResults: AgentResult[] = validPrompts.map((p, i) => ({
      index: i, label: p.slice(0, 40), content: '', status: 'streaming' as const,
    }));
    setResults(agentResults);

    const fileContext = Array.from(files.entries())
      .map(([path, content]) => `=== ${path} ===\n${content}`)
      .join('\n\n');
    const recentMessages = messages.slice(-5).map((m) => `${m.role}: ${m.content.slice(0, 200)}`).join('\n');

    const agentPromises = validPrompts.map(async (prompt, i) => {
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectId: currentProject.id,
            messages: [
              { role: 'system' as const, content: 'You are a code review agent. Be concise and specific.' },
              { role: 'user' as const, content: `## Context\n\n${fileContext}\n\n## Recent Messages\n${recentMessages}\n\n## Task\n${prompt}` },
            ],
            model: currentProject.selectedModel,
            framework: currentProject.framework,
            multiAgent: true,
          }),
        });
        if (!res.ok) throw new Error('Agent request failed');
        const data = await res.json();
        setResults((prev) => prev.map((r) =>
          r.index === i ? { ...r, content: data.content || data.text || '', status: 'done' as const } : r
        ));
        return { index: i, content: data.content || data.text || '' };
      } catch (err: any) {
        setResults((prev) => prev.map((r) =>
          r.index === i ? { ...r, status: 'error' as const, error: err.message } : r
        ));
        return { index: i, content: `Error: ${err.message}` };
      }
    });

    const outputs = await Promise.all(agentPromises);
    const combined = outputs.map((o) => o.content).join('\n\n---\n\n');

    await addMessage(currentProject.id, {
      role: 'assistant',
      content: `## Multi-Agent Results\n\n${combined}`,
      timestamp: new Date(),
      tokensUsed: 0,
      modelUsed: currentProject.selectedModel,
      provider: 'opencode',
      files: null,
    });

    setRunning(false);
  }, [idToken, currentProject, prompts, running, files, messages, addMessage]);

  if (!expanded) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setExpanded(true)}
        className="text-xs text-[#a6adc8] hover:text-[#cdd6f4] hover:bg-[#313244]"
      >
        <Layers className="h-3 w-3 mr-1" />
        Multi-Agent
      </Button>
    );
  }

  return (
    <div className="border border-[#313244] rounded-lg bg-[#1e1e2e] p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-[#cdd6f4]">Multi-Agent Runner</span>
        <Button variant="ghost" size="sm" onClick={() => setExpanded(false)} className="h-6 w-6 p-0">
          <X className="h-3 w-3" />
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {prompts.map((p, i) => (
          <div key={i} className="flex gap-1">
            <Textarea
              value={p}
              onChange={(e) => updatePrompt(i, e.target.value)}
              placeholder={`Agent ${i + 1} prompt...`}
              className="min-h-[36px] text-xs bg-[#181825] border-[#313244] text-[#cdd6f4] flex-1"
              rows={1}
            />
            {prompts.length > 1 && (
              <Button variant="ghost" size="sm" onClick={() => removePrompt(i)} className="h-9 w-6 p-0">
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
        <Button variant="ghost" size="sm" onClick={addPrompt} className="text-xs text-[#a6adc8] self-start">
          + Add Agent
        </Button>
        <Button
          onClick={runAgents}
          disabled={running || !prompts.some((p) => p.trim())}
          className="bg-[#cba6f7] text-[#1e1e2e] hover:bg-[#b4befe] text-xs"
        >
          {running ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Layers className="h-3 w-3 mr-1" />}
          Run Agents
        </Button>
        {results.length > 0 && (
          <div className="flex flex-col gap-2 mt-2">
            {results.map((r) => (
              <div key={r.index} className="text-xs border border-[#313244] rounded p-2">
                <div className="flex items-center gap-1 mb-1">
                  {r.status === 'done' ? <Check className="h-3 w-3 text-[#a6e3a1]" /> :
                   r.status === 'error' ? <X className="h-3 w-3 text-red-400" /> :
                   <Loader2 className="h-3 w-3 text-[#f9e2af] animate-spin" />}
                  <span className="font-medium text-[#cdd6f4]">{r.label}</span>
                </div>
                <pre className="text-[#a6adc8] whitespace-pre-wrap">{r.content.slice(0, 300)}{r.content.length > 300 ? '...' : ''}</pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
