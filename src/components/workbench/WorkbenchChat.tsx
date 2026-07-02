'use client';
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Square,
  Sparkles,
  Wand2,
  Wrench,
  Mic,
  Image as ImageIcon,
  Layers,
  X,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Bot,
  User as UserIcon,
} from 'lucide-react';
import { useStreaming, type ProgressPhase, type FileChangeSummary } from '@/lib/hooks/useStreaming';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { useProjectStore } from '@/lib/store/useProjectStore';
import { AVAILABLE_MODELS } from '@/lib/types/ai';
import { PROVIDER_LABELS as providerLabels } from '@/lib/utils/constants';
import { StructuredMessage } from '@/components/chat/StructuredMessage';
import { AgentMessage } from '@/components/chat/AgentMessage';
import { ScreenshotInput } from '@/components/editor/ScreenshotInput';
import { VoiceInput } from '@/components/editor/VoiceInput';
import { MultiAgentPanel } from '@/components/editor/MultiAgentPanel';
import { cn } from '@/lib/utils/cn';

interface WorkbenchChatProps {
  projectId: string;
  variant?: 'panel' | 'sheet';
}

const phaseOrder: ProgressPhase[] = ['sending', 'generating', 'parsing', 'repairing'];

const phaseLabel: Record<ProgressPhase, string> = {
  idle: '',
  sending: 'Connecting to AI',
  generating: 'Generating code',
  parsing: 'Processing output',
  repairing: 'Repairing output',
  complete: 'Done',
  error: 'Error',
};

export function WorkbenchChat({ projectId, variant = 'panel' }: WorkbenchChatProps) {
  const [prompt, setPrompt] = useState('');
  const [multiAgentOpen, setMultiAgentOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isStreaming,
    fallbackInfo,
    fallbackCountdown,
    fallbackCountdownActive,
    fallbackReason,
    fallbackFromModel,
    fallbackToModel,
    partialOutputCount,
    providerErrors,
    progressPhase,
    progressStatus,
    fileChangeSummary,
    agentEvents,
    sendMessage,
    cancelStream,
    switchNow,
    acceptFallback,
    revertFallback,
    clearProviderErrors,
  } = useStreaming();

  const isReadOnly = useEditorStore((s) => s.isReadOnly);
  const pendingScreenshots = useEditorStore((s) => s.pendingScreenshots);
  const clearScreenshots = useEditorStore((s) => s.clearScreenshots);
  const removeScreenshot = useEditorStore((s) => s.removeScreenshot);
  const currentProject = useProjectStore((s) => s.currentProject);
  const selectedModel = AVAILABLE_MODELS.find(
    (m) => m.id === currentProject?.selectedModel,
  );
  const providerLabel = selectedModel ? providerLabels[selectedModel.provider] : 'AI';

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  }, [prompt]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isStreaming]);

  // Auto-fix trigger
  const pendingBuildError = useEditorStore((s) => s.pendingBuildError);
  const clearAutoFix = useEditorStore((s) => s.clearAutoFix);
  useEffect(() => {
    if (pendingBuildError && !isStreaming) {
      const fixPrompt = `Fix the following build error:\n\n${pendingBuildError}\n\nAnalyze the error and provide a fix.`;
      sendMessage(fixPrompt);
      clearAutoFix();
    }
  }, [pendingBuildError, isStreaming, sendMessage, clearAutoFix]);

  const handleSend = useCallback(() => {
    if (!prompt.trim() || isStreaming) return;
    sendMessage(prompt.trim());
    setPrompt('');
  }, [prompt, isStreaming, sendMessage]);

  const handleAction = useCallback(
    (action: 'improve' | 'refactor' | 'fix') => {
      if (isStreaming) return;
      sendMessage(prompt.trim() || '', action);
      setPrompt('');
    },
    [prompt, isStreaming, sendMessage],
  );

  const handleKey = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 relative">
      {/* Header strip */}
      <div
        className={cn(
          'flex items-center justify-between gap-2 px-3 sm:px-4 border-b border-border/40',
          variant === 'sheet' ? 'h-11' : 'h-12',
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative h-7 w-7 shrink-0">
            <div className="absolute inset-0 rounded-lg gradient-primary opacity-90" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[12px] font-semibold text-foreground truncate leading-none">
              AI Assistant
            </span>
            <span className="text-[10px] text-muted-foreground/70 truncate">
              {providerLabel} · {selectedModel?.displayName?.split(' ')[0] ?? ''}
            </span>
          </div>
        </div>
        <button
          onClick={() => setMultiAgentOpen((o) => !o)}
          className={cn(
            'h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-[11px] font-medium wb-press transition-colors',
            multiAgentOpen
              ? 'bg-primary/15 text-primary'
              : 'bg-secondary/60 text-muted-foreground hover:text-foreground',
          )}
        >
          <Layers className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Multi-Agent</span>
        </button>
      </div>

      {multiAgentOpen && (
        <div className="px-3 py-2 border-b border-border/30">
          <MultiAgentPanel />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <EmptyState />
        )}

        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            role={msg.role}
            content={msg.content}
            showAgent={!isStreaming && agentEvents.length > 0 && i === messages.length - 1}
            agentEvents={agentEvents}
          />
        ))}

        {/* Streaming indicator */}
        <AnimatePresence>
          {isStreaming && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="flex justify-start"
            >
              <div className="wb-card max-w-[88%] sm:max-w-[78%] p-3.5">
                <ProgressSteps
                  phase={progressPhase}
                  status={progressStatus}
                  provider={providerLabel}
                />
                {agentEvents.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/40">
                    <AgentMessage events={agentEvents} />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* File change summary */}
        {fileChangeSummary && !isStreaming && (
          <FileChangeCard summary={fileChangeSummary} />
        )}

        {/* Provider errors */}
        {providerErrors.length > 0 && (
          <div className="space-y-2">
            {providerErrors.map((err, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="wb-card p-3 flex items-start gap-2.5 !border-red-500/30 bg-red-500/5"
              >
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-foreground/90 flex-1 break-words">{err}</p>
                {i === providerErrors.length - 1 && (
                  <button
                    onClick={clearProviderErrors}
                    className="h-6 w-6 rounded-md flex items-center justify-center hover:bg-secondary/60 wb-press"
                    aria-label="Dismiss"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Fallback notifications */}
      <AnimatePresence>
        {fallbackCountdownActive && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mx-3 sm:mx-4 mb-2"
          >
            <div className="wb-card p-3 border-amber-500/40 bg-amber-500/5">
              <div className="flex items-start gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">{fallbackReason}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Switching to{' '}
                    <strong className="text-foreground">{fallbackToModel}</strong> in{' '}
                    <strong className="text-foreground">{fallbackCountdown}</strong>s
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={switchNow}
                    className="text-[11px] h-7 px-2.5 rounded-lg bg-amber-500 text-white font-medium wb-press"
                  >
                    Switch Now
                  </button>
                  <button
                    onClick={revertFallback}
                    className="text-[11px] h-7 px-2.5 rounded-lg border border-amber-500/40 text-amber-600 dark:text-amber-400 wb-press"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              <div className="mt-2 h-1 rounded-full bg-amber-500/20 overflow-hidden">
                <motion.div
                  className="h-full bg-amber-500"
                  initial={{ width: '100%' }}
                  animate={{ width: 0 }}
                  transition={{ duration: fallbackCountdown, ease: 'linear' }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {fallbackInfo && !fallbackCountdownActive && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mx-3 sm:mx-4 mb-2"
          >
            <div className="wb-card p-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                <p className="text-xs flex-1">
                  Switched from{' '}
                  <span className="font-medium">{fallbackInfo.from}</span> →{' '}
                  <span className="font-medium">{fallbackInfo.to}</span>
                </p>
                <button
                  onClick={acceptFallback}
                  className="text-[11px] h-7 px-2.5 rounded-lg bg-primary text-primary-foreground wb-press"
                >
                  Accept
                </button>
                <button
                  onClick={revertFallback}
                  className="text-[11px] h-7 px-2.5 rounded-lg border border-border/60 wb-press"
                >
                  Revert
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {partialOutputCount > 0 && !fallbackCountdownActive && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="mx-3 sm:mx-4 mb-2"
          >
            <div className="text-[11px] text-muted-foreground text-center">
              Response interrupted after {partialOutputCount} tokens. Switching models…
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="px-3 sm:px-4 pt-2 pb-3 sm:pb-4 border-t border-border/30 bg-gradient-to-t from-background/80 to-transparent backdrop-blur-md">
        {/* Screenshot previews */}
        <AnimatePresence>
          {pendingScreenshots.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-2 mb-2 overflow-x-auto no-scrollbar"
            >
              {pendingScreenshots.map((s, i) => (
                <div
                  key={i}
                  className="relative shrink-0 h-14 w-14 rounded-lg overflow-hidden border border-border/50"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s}
                    alt={`screenshot ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    onClick={() => removeScreenshot(i)}
                    className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-black/70 flex items-center justify-center text-white wb-press"
                    aria-label="Remove screenshot"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <button
                onClick={clearScreenshots}
                className="shrink-0 h-14 px-3 rounded-lg text-[11px] text-muted-foreground bg-secondary/40 border border-border/40"
              >
                Clear all
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="wb-card !rounded-2xl p-1.5 flex flex-col gap-1.5">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKey}
            placeholder={
              isStreaming
                ? 'AI is working…'
                : isReadOnly
                ? 'Ask AI to improve, refactor, or fix…'
                : 'Describe what to build…'
            }
            disabled={isStreaming}
            rows={1}
            className="w-full bg-transparent text-[13px] sm:text-sm text-foreground placeholder:text-muted-foreground/60 px-2 py-1.5 resize-none outline-none disabled:opacity-50 max-h-[180px] overflow-y-auto"
          />

          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-0.5">
              <ScreenshotInput />
              <VoiceInput
                onTranscript={(t) =>
                  setPrompt((p) => (p ? `${p} ${t}` : t))
                }
              />
            </div>

            <div className="flex items-center gap-1.5">
              {isReadOnly && !isStreaming ? (
                <>
                  <ActionPill
                    onClick={() => handleAction('improve')}
                    disabled={!prompt.trim()}
                    icon={<Wand2 className="h-3 w-3" />}
                    label="Improve"
                  />
                  <ActionPill
                    onClick={() => handleAction('refactor')}
                    disabled={!prompt.trim()}
                    icon={<Sparkles className="h-3 w-3" />}
                    label="Refactor"
                    variant="secondary"
                  />
                  <ActionPill
                    onClick={() => handleAction('fix')}
                    disabled={!prompt.trim()}
                    icon={<Wrench className="h-3 w-3" />}
                    label="Fix"
                    variant="destructive"
                  />
                </>
              ) : null}
              {isStreaming ? (
                <button
                  onClick={cancelStream}
                  className="h-8 w-8 rounded-xl bg-destructive text-destructive-foreground flex items-center justify-center wb-press"
                  aria-label="Cancel"
                >
                  <Square className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!prompt.trim()}
                  className={cn(
                    'h-8 px-3 rounded-xl flex items-center gap-1.5 text-[11px] font-semibold wb-press',
                    prompt.trim()
                      ? 'gradient-primary text-white shadow-glow'
                      : 'bg-secondary/60 text-muted-foreground',
                  )}
                >
                  <Send className="h-3 w-3" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {isReadOnly && (
          <p className="text-[10px] text-muted-foreground text-center mt-1.5">
            Manual edits don&apos;t auto-trigger AI. Use action buttons.
          </p>
        )}
      </div>
    </div>
  );
}

function ActionPill({
  onClick,
  disabled,
  icon,
  label,
  variant = 'primary',
}: {
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  variant?: 'primary' | 'secondary' | 'destructive';
}) {
  const tone =
    variant === 'primary'
      ? 'bg-primary text-primary-foreground'
      : variant === 'destructive'
      ? 'bg-destructive/15 text-destructive border border-destructive/30'
      : 'bg-secondary text-foreground border border-border/60';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'h-7 px-2 sm:px-2.5 rounded-lg flex items-center gap-1 text-[10px] sm:text-[11px] font-medium wb-press',
        tone,
        disabled && 'opacity-50',
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function MessageBubble({
  role,
  content,
  showAgent,
  agentEvents,
}: {
  role: 'user' | 'assistant';
  content: string;
  showAgent?: boolean;
  agentEvents?: any[];
}) {
  const isUser = role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-2', isUser ? 'justify-end' : 'justify-start')}
    >
      {!isUser && (
        <div className="h-7 w-7 shrink-0 rounded-lg gradient-primary flex items-center justify-center mt-1">
          <Bot className="h-3.5 w-3.5 text-white" />
        </div>
      )}
      <div
        className={cn(
          'max-w-[85%] sm:max-w-[78%] p-3 text-[13px] sm:text-sm leading-relaxed',
          isUser
            ? 'gradient-primary text-white rounded-2xl rounded-br-md shadow-glow'
            : 'wb-card !rounded-2xl !rounded-bl-md',
        )}
      >
        {isUser ? (
          <span className="whitespace-pre-wrap break-words">{content}</span>
        ) : (
          <>
            <StructuredMessage content={content} />
            {showAgent && agentEvents && agentEvents.length > 0 && (
              <div className="mt-2 pt-2 border-t border-border/40">
                <AgentMessage events={agentEvents} />
              </div>
            )}
          </>
        )}
      </div>
      {isUser && (
        <div className="h-7 w-7 shrink-0 rounded-lg bg-secondary flex items-center justify-center mt-1">
          <UserIcon className="h-3.5 w-3.5" />
        </div>
      )}
    </motion.div>
  );
}

function ProgressSteps({
  phase,
  status,
  provider,
}: {
  phase: ProgressPhase;
  status: string;
  provider: string;
}) {
  if (phase === 'idle' || phase === 'complete' || phase === 'error') return null;
  const currentIndex = phaseOrder.indexOf(phase);
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary wb-pulse-dot text-primary" />
          <span className="h-1.5 w-1.5 rounded-full bg-primary/60 wb-pulse-dot text-primary" style={{ animationDelay: '0.2s' }} />
          <span className="h-1.5 w-1.5 rounded-full bg-primary/30 wb-pulse-dot text-primary" style={{ animationDelay: '0.4s' }} />
        </div>
        <span className="text-[12px] font-semibold text-foreground">
          {phaseLabel[phase]}
        </span>
        <span className="text-[10px] text-muted-foreground ml-auto">
          via {provider}
        </span>
      </div>
      <div className="flex items-center gap-1">
        {phaseOrder.map((p, i) => (
          <div
            key={p}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              i <= currentIndex ? 'bg-primary' : 'bg-secondary',
            )}
          />
        ))}
      </div>
      {status && (
        <p className="text-[10px] text-muted-foreground truncate">{status}</p>
      )}
    </div>
  );
}

function FileChangeCard({ summary }: { summary: FileChangeSummary }) {
  const total = summary.created.length + summary.modified.length + summary.deleted.length;
  if (total === 0) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="wb-card p-3"
    >
      {summary.summary && (
        <p className="text-[12px] text-foreground/90 leading-relaxed mb-2">
          {summary.summary}
        </p>
      )}
      <div className="flex items-center gap-2 mb-2 text-[10px]">
        <span className="font-semibold text-foreground">File changes</span>
        {summary.created.length > 0 && (
          <span className="text-green-500 font-medium">+{summary.created.length}</span>
        )}
        {summary.modified.length > 0 && (
          <span className="text-amber-500 font-medium">~{summary.modified.length}</span>
        )}
        {summary.deleted.length > 0 && (
          <span className="text-red-500 font-medium">-{summary.deleted.length}</span>
        )}
      </div>
      <div className="space-y-1 max-h-32 overflow-y-auto no-scrollbar">
        {[
          ...summary.created.map((p) => ({ p, action: 'create' as const })),
          ...summary.modified.map((p) => ({ p, action: 'modify' as const })),
          ...summary.deleted.map((p) => ({ p, action: 'delete' as const })),
        ].map(({ p, action }) => (
          <div key={p} className="flex items-start gap-1.5 text-[10px]">
            <span
              className={cn(
                'font-bold w-3 shrink-0 text-center',
                action === 'create' && 'text-green-500',
                action === 'modify' && 'text-amber-500',
                action === 'delete' && 'text-red-500',
              )}
            >
              {action === 'create' ? '+' : action === 'modify' ? '~' : '-'}
            </span>
            <span className="font-mono text-foreground/80 truncate flex-1">{p}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function EmptyState() {
  const prompts = [
    { label: 'Build a landing page', emoji: '🎨' },
    { label: 'Add dark mode toggle', emoji: '🌙' },
    { label: 'Create a contact form', emoji: '✉️' },
    { label: 'Add a pricing section', emoji: '💎' },
  ];
  return (
    <div className="text-center py-8 px-2">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative inline-block mb-4"
      >
        <div
          className="h-16 w-16 rounded-2xl gradient-primary mx-auto flex items-center justify-center"
          style={{ transform: 'perspective(400px) rotateX(8deg) rotateY(-8deg)' }}
        >
          <Sparkles className="h-7 w-7 text-white" />
        </div>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-10 rounded-full bg-primary/40 blur-md" />
      </motion.div>
      <h3 className="text-sm font-semibold text-foreground mb-1">
        What should we build?
      </h3>
      <p className="text-[11px] text-muted-foreground mb-4 max-w-[260px] mx-auto">
        Describe your idea in natural language. AI writes the code.
      </p>
      <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
        {prompts.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => {
              const input = document.querySelector('textarea') as HTMLTextAreaElement | null;
              if (input) {
                const setter = Object.getOwnPropertyDescriptor(
                  window.HTMLTextAreaElement.prototype,
                  'value',
                )?.set;
                setter?.call(input, p.label);
                input.dispatchEvent(new Event('input', { bubbles: true }));
              }
            }}
            className="wb-card p-2.5 text-left text-[11px] flex items-center gap-2 hover:scale-[1.02] transition-transform wb-press"
          >
            <span className="text-base">{p.emoji}</span>
            <span className="text-foreground/90 flex-1 leading-tight">{p.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
