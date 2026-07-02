'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { STRENGTH_META, type PasswordEvaluation, type PasswordRule } from '@/lib/utils/password-strength';

export interface PasswordStrengthProps {
  evaluation: PasswordEvaluation;
  show: boolean; // only show rules once the user starts typing
}

export function PasswordStrength({ evaluation, show }: PasswordStrengthProps) {
  const meta = STRENGTH_META[evaluation.strength];

  return (
    <div
      className="mt-3 space-y-3"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Bar: 4 segments that fill + color as the tier rises */}
      <div className="flex items-center gap-1.5" role="presentation">
        {[1, 2, 3, 4].map((segment) => {
          const active = evaluation.score >= segment && evaluation.strength !== 'empty';
          return (
            <div
              key={segment}
              className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden"
            >
              <motion.div
                className={`h-full ${active ? meta.bar : 'bg-transparent'}`}
                initial={false}
                animate={{
                  width: active ? '100%' : '0%',
                  opacity: active ? 1 : 0,
                }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              />
            </div>
          );
        })}
      </div>

      {/* Strength label + count */}
      <div className="flex items-center justify-between min-h-[1.25rem]">
        <AnimatePresence mode="wait">
          {show && evaluation.strength !== 'empty' ? (
            <motion.span
              key={evaluation.strength}
              initial={{ opacity: 0, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 2 }}
              transition={{ duration: 0.15 }}
              className={`text-xs font-semibold ${meta.text}`}
            >
              {meta.label}
            </motion.span>
          ) : (
            <motion.span
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-muted-foreground"
            >
              Password strength
            </motion.span>
          )}
        </AnimatePresence>
        {show && evaluation.strength !== 'empty' && (
          <span className="text-[11px] text-muted-foreground tabular-nums">
            {evaluation.rules.filter((r) => r.passed).length}/{evaluation.rules.length} rules
          </span>
        )}
      </div>

      {/* Rules checklist — visible once the user starts typing */}
      <AnimatePresence initial={false}>
        {show && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <ul className="grid grid-cols-1 gap-1.5">
                {evaluation.rules.map((rule) => (
                  <RuleRow key={rule.id} rule={rule} />
                ))}
              </ul>
            </div>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function RuleRow({ rule }: { rule: PasswordRule }) {
  return (
    <li
      className={`flex items-start gap-2 text-xs leading-snug transition-colors duration-200 ${
        rule.passed ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
      }`}
    >
      <span
        className={`shrink-0 mt-px inline-flex h-3.5 w-3.5 items-center justify-center rounded-full transition-colors duration-200 ${
          rule.passed
            ? 'bg-green-500/15 text-green-600 dark:text-green-400'
            : 'bg-muted-foreground/15 text-muted-foreground'
        }`}
        aria-hidden="true"
      >
        {rule.passed ? (
          <svg className="h-2.5 w-2.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M2 6.5L4.5 9L10 3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg className="h-2.5 w-2.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3L9 9M9 3L3 9" strokeLinecap="round" />
          </svg>
        )}
      </span>
      <span className="flex-1">
        {rule.label}
        {rule.required && !rule.passed && (
          <span className="ml-1 text-[10px] uppercase tracking-wide text-muted-foreground/80">
            required
          </span>
        )}
      </span>
    </li>
  );
}
