'use client';
import type { AgentEventPayload } from '@/lib/types/ai';
import { ThinkingPlan } from './ThinkingPlan';
import { ToolCallBubble } from './ToolCallBubble';
import { AgentDiffBubble } from './AgentDiffBubble';
import { TerminalBubble } from './TerminalBubble';
import { AgentSummary } from './AgentSummary';

export function AgentMessage({ events }: { events: AgentEventPayload[] }) {
  if (events.length === 0) return null;

  return (
    <div className="space-y-0.5">
      {events.map((event, i) => {
        switch (event.type) {
          case 'thinking':
            return <ThinkingPlan key={i} steps={event.data.steps} />;
          case 'tool':
            return <ToolCallBubble key={i} tool={event.data.tool} file={event.data.file} description={event.data.description} />;
          case 'diff':
            return <AgentDiffBubble key={i} file={event.data.file} oldContent={event.data.oldContent} newContent={event.data.newContent} action={event.data.action} />;
          case 'terminal':
            return <TerminalBubble key={i} command={event.data.command} output={event.data.output} exitCode={event.data.exitCode} />;
          case 'summary':
            return <AgentSummary key={i} data={event.data} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
