'use client';
import { useState, useRef, useEffect } from 'react';
import { useStreaming, ProgressPhase, FileChangeSummary } from '@/lib/hooks/useStreaming';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { useProjectStore } from '@/lib/store/useProjectStore';
import { AVAILABLE_MODELS } from '@/lib/types/ai';
import { PROVIDER_LABELS as providerLabels } from '@/lib/utils/constants';
import { Button } from '@/components/ui/button';
import { AIStreamingIndicator, AIFallbackNotification, CountdownFallbackNotification, AIProviderStatus, AIErrorNotification, PartialOutputNotification } from '@/components/shared/streaming-states';
import { StructuredMessage } from '@/components/chat/StructuredMessage';
import { AgentMessage } from '@/components/chat/AgentMessage';
import { ScreenshotInput } from './ScreenshotInput';
import { VoiceInput } from './VoiceInput';
import { MultiAgentPanel } from './MultiAgentPanel';
import { TemplateMarketplace } from './TemplateMarketplace';
import { LayoutTemplate, Layers } from 'lucide-react';

interface ChatPanelProps {
  projectId: string;
}

function ProgressSteps({ phase, status, provider }: { phase: ProgressPhase; status: string; provider: string }) {
  const steps = [
    { key: 'sending' as const, label: status.startsWith('Loading') ? status : 'Analyzing project...' },
    { key: 'generating' as const, label: 'Generating code...' },
    { key: 'parsing' as const, label: status || 'Processing output...' },
    { key: 'repairing' as const, label: 'Repairing output...' },
  ];

  const currentIndex = steps.findIndex((s) => s.key === phase);
  if (phase === 'idle' || phase === 'complete' || phase === 'error') return null;

  const currentStep = steps.find((s) => s.key === phase);
  const displayLabel = currentStep?.label || 'Working...';

  return (
    <div className="space-y-2">
      {steps.slice(0, currentIndex + 1).map((step, i) => (
        <div key={step.key} className="flex items-center gap-2">
          {i < currentIndex ? (
            <span className="h-4 w-4 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
              <svg className="h-2.5 w-2.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </span>
          ) : (
            <span className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            </span>
          )}
          <span className={`text-xs ${i < currentIndex ? 'text-green-600 dark:text-green-400' : i === currentIndex ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
            {step.label}
          </span>
          {i === currentIndex && (
            <span className="text-[10px] text-muted-foreground">via {provider}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function FormattedMessage({ content }: { content: string }) {
  return <StructuredMessage content={content} />;
}

function FileChangeCard({ summary }: { summary: FileChangeSummary }) {
  const total = summary.created.length + summary.modified.length + summary.deleted.length;
  if (total === 0) return null;

  const renderFileList = (paths: string[], color: string, action: string) => {
    if (paths.length === 0) return null;
    return (
      <div className="space-y-0.5 mt-1">
        {paths.map((p) => (
          <div key={p} className="flex items-start gap-1.5">
            <span className={`text-[10px] font-medium shrink-0 ${color}`}>{action === 'create' ? '+' : action === 'modify' ? '~' : '-'}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/50 font-mono truncate max-w-[200px]">{p}</span>
            {summary.descriptions?.[p] && (
              <span className="text-[10px] text-muted-foreground leading-relaxed truncate">— {summary.descriptions[p]}</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="mt-2 p-2.5 rounded-lg bg-secondary/30 border border-border/50 text-xs">
      {summary.summary && (
        <p className="text-[11px] text-foreground mb-2 leading-relaxed">{summary.summary}</p>
      )}
      <div className="flex items-center gap-2 mb-1.5">
        <span className="font-medium text-foreground text-[11px]">File changes</span>
        {summary.created.length > 0 && <span className="text-green-600 dark:text-green-400 text-[10px]">+{summary.created.length} created</span>}
        {summary.modified.length > 0 && <span className="text-amber-600 dark:text-amber-400 text-[10px]">~{summary.modified.length} modified</span>}
        {summary.deleted.length > 0 && <span className="text-red-600 dark:text-red-400 text-[10px]">-{summary.deleted.length} deleted</span>}
      </div>
      {renderFileList(summary.created, 'text-green-600 dark:text-green-400', 'create')}
      {renderFileList(summary.modified, 'text-amber-600 dark:text-amber-400', 'modify')}
      {renderFileList(summary.deleted, 'text-red-600 dark:text-red-400', 'delete')}
    </div>
  );
}

export function ChatPanel({ projectId }: ChatPanelProps) {
  const [prompt, setPrompt] = useState('');
  const { messages, isStreaming, fallbackInfo, fallbackCountdown, fallbackCountdownActive, fallbackReason, fallbackFromModel, fallbackToModel, partialOutputCount, providerErrors, progressPhase, progressStatus, fileChangeSummary, agentEvents, sendMessage, cancelStream, switchNow, acceptFallback, revertFallback, clearProviderErrors, clearGeneration } =
    useStreaming();
  const isReadOnly = useEditorStore((s) => s.isReadOnly);
  const currentProject = useProjectStore((s) => s.currentProject);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [multiAgentOpen, setMultiAgentOpen] = useState(false);

  const selectedModel = AVAILABLE_MODELS.find((m) => m.id === currentProject?.selectedModel);
  const providerLabel = selectedModel ? providerLabels[selectedModel.provider] : 'AI';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const pendingBuildError = useEditorStore((s) => s.pendingBuildError);
  const clearAutoFix = useEditorStore((s) => s.clearAutoFix);
  useEffect(() => {
    if (pendingBuildError && !isStreaming) {
      const fixPrompt = `Fix the following build error:\n\n${pendingBuildError}\n\nAnalyze the error and provide a fix.`;
      sendMessage(fixPrompt);
      clearAutoFix();
    }
  }, [pendingBuildError, isStreaming, sendMessage, clearAutoFix]);

  const handleSend = () => {
    if (!prompt.trim() || isStreaming) return;
    sendMessage(prompt.trim());
    setPrompt('');
  };

  const handleManualAction = (action: 'improve' | 'refactor' | 'fix') => {
    if (isStreaming) return;
    sendMessage(prompt.trim() || '', action);
    setPrompt('');
  };

  const handleVoiceTranscript = (text: string) => {
    setPrompt((prev) => (prev ? `${prev} ${text}` : text));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-dark-border bg-dark-bg">
        <h3 className="text-xs font-medium text-foreground">AI Chat</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTemplateOpen(true)}
            className="h-6 w-6 rounded flex items-center justify-center text-[#a6adc8] hover:text-[#cdd6f4] hover:bg-[#313244]"
            title="Templates"
          >
            <LayoutTemplate className="h-3 w-3" />
          </button>
          <button
            onClick={() => setMultiAgentOpen(!multiAgentOpen)}
            className={`h-6 w-6 rounded flex items-center justify-center ${multiAgentOpen ? 'bg-[#cba6f7]/10 text-[#cba6f7]' : 'text-[#a6adc8] hover:text-[#cdd6f4] hover:bg-[#313244]'}`}
            title="Multi-Agent"
          >
            <Layers className="h-3 w-3" />
          </button>
          <AIProviderStatus provider={providerLabel} status="active" latency="120ms" />
        </div>
      </div>

      {/* Multi-Agent Panel */}
      {multiAgentOpen && (
        <div className="px-3 py-2 border-b border-[#313244]">
          <MultiAgentPanel />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-foreground mb-1">What do you want to build?</p>
            <p className="text-xs text-muted-foreground">Describe your app in natural language</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-xl text-sm ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                  : 'bg-secondary text-foreground rounded-bl-sm'
              }`}
            >
              {msg.role === 'assistant' ? (
                <>
                  <FormattedMessage content={msg.content} />
                  {/* Render agent events for the last assistant message */}
                  {!isStreaming && agentEvents.length > 0 && i === messages.length - 1 && (
                    <div className="mt-2">
                      <AgentMessage events={agentEvents} />
                    </div>
                  )}
                </>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {/* Streaming indicator with progress steps */}
        {isStreaming && (
          <div className="flex justify-start">
            <div className="bg-secondary rounded-xl rounded-bl-sm p-3 min-w-[200px]">
              <ProgressSteps phase={progressPhase} status={progressStatus} provider={selectedModel ? providerLabels[selectedModel.provider] : 'AI'} />
              {agentEvents.length > 0 && (
                <div className="mt-2 border-t border-border/50 pt-2">
                  <AgentMessage events={agentEvents} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* File change summary card for last message */}
        {fileChangeSummary && !isStreaming && (
          <div className="flex justify-start">
            <div className="max-w-[85%]">
              <FileChangeCard summary={fileChangeSummary} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Countdown fallback — shown before model switch */}
      {fallbackCountdownActive && (
        <div className="px-3 pb-2">
          <CountdownFallbackNotification
            visible={fallbackCountdownActive}
            fromModel={fallbackFromModel}
            toModel={fallbackToModel}
            reason={fallbackReason}
            countdown={fallbackCountdown}
            onSwitchNow={switchNow}
            onCancel={revertFallback}
          />
        </div>
      )}

      {/* Post-switch fallback notification */}
      {fallbackInfo && !fallbackCountdownActive && (
        <div className="px-3 pb-2">
          <AIFallbackNotification
            visible={!!fallbackInfo}
            from={fallbackInfo.from}
            to={fallbackInfo.to}
            timeRemaining={5}
            onAccept={acceptFallback}
            onCancel={revertFallback}
          />
        </div>
      )}

      {/* Partial output notification */}
      {partialOutputCount > 0 && !fallbackCountdownActive && (
        <div className="px-3 pb-2">
          <PartialOutputNotification
            visible={partialOutputCount > 0}
            tokenCount={partialOutputCount}
          />
        </div>
      )}

      {/* Provider errors */}
      {providerErrors.length > 0 && (
        <div className="px-3 pb-2 space-y-2">
          {providerErrors.map((err, i) => (
            <AIErrorNotification
              key={i}
              error={err}
              onClose={i === providerErrors.length - 1 ? clearProviderErrors : undefined}
            />
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="p-3 border-t border-border">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isStreaming ? 'Waiting for response...' : 'Describe your changes...'}
            disabled={isStreaming}
            rows={2}
            className="w-full bg-secondary text-foreground rounded-lg p-3 pr-10 text-sm border border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/30 resize-none placeholder:text-muted-foreground disabled:opacity-50 transition-all"
          />
          {!isReadOnly && !isStreaming && (
            <button
              onClick={handleSend}
              disabled={!prompt.trim()}
              className="absolute right-2 bottom-2 h-7 w-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-30 transition-opacity"
              aria-label="Send message"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          )}
          {isStreaming && (
            <button
              onClick={cancelStream}
              className="absolute right-2 bottom-2 h-7 w-7 rounded-md bg-destructive text-destructive-foreground flex items-center justify-center"
              aria-label="Cancel streaming"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Toolbar row */}
        <div className="flex items-center gap-1 mt-1.5">
          <ScreenshotInput />
          <VoiceInput onTranscript={handleVoiceTranscript} />
          {isReadOnly && (
            <TemplateMarketplace open={templateOpen} onOpenChange={setTemplateOpen} />
          )}
        </div>

        <div className="flex gap-2 mt-2">
          {isReadOnly ? (
            <>
              <Button
                size="sm"
                onClick={() => handleManualAction('improve')}
                disabled={isStreaming || !prompt.trim()}
                className="flex-1 h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Improve Code
              </Button>
              <Button
                size="sm"
                onClick={() => handleManualAction('refactor')}
                disabled={isStreaming || !prompt.trim()}
                className="flex-1 h-8 text-xs bg-secondary text-foreground hover:bg-secondary/80 border border-border"
              >
                Refactor
              </Button>
              <Button
                size="sm"
                onClick={() => handleManualAction('fix')}
                disabled={isStreaming || !prompt.trim()}
                className="flex-1 h-8 text-xs bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20"
              >
                Fix
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={handleSend}
              disabled={isStreaming || !prompt.trim()}
              className="flex-1 h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Send
            </Button>
          )}
        </div>
        {isReadOnly && (
          <p className="text-[10px] text-muted-foreground mt-1 text-center">
            Manual code edits don&apos;t auto-trigger AI. Use buttons above.
          </p>
        )}
      </div>
    </div>
  );
}
