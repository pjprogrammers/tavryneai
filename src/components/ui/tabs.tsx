'use client';
import * as React from 'react';
import { cn } from '@/lib/utils/cn';

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

function Tabs({ value, onValueChange, children, className, id }: TabsProps) {
  const baseId = React.useId();
  const tabsId = id || baseId;
  return (
    <div className={className} data-value={value}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(
            child as React.ReactElement<any>,
            { _value: value, _onValueChange: onValueChange, _tabsId: tabsId },
          );
        }
        return child;
      })}
    </div>
  );
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
  _value?: string;
  _onValueChange?: (value: string) => void;
  _tabsId?: string;
}

function TabsList({ children, className, _value, _onValueChange, _tabsId }: TabsListProps) {
  const listRef = React.useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Home' && e.key !== 'End') return;
    const triggers = listRef.current
      ? Array.from(listRef.current.querySelectorAll<HTMLButtonElement>('[role="tab"]'))
      : [];
    if (triggers.length === 0) return;
    const currentIndex = triggers.findIndex((t) => t.getAttribute('aria-selected') === 'true');
    let nextIndex = currentIndex;
    if (e.key === 'ArrowRight') nextIndex = (currentIndex + 1) % triggers.length;
    else if (e.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + triggers.length) % triggers.length;
    else if (e.key === 'Home') nextIndex = 0;
    else if (e.key === 'End') nextIndex = triggers.length - 1;
    e.preventDefault();
    const next = triggers[nextIndex];
    next?.focus();
    if (next && _onValueChange) _onValueChange(next.dataset.value || '');
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-orientation="horizontal"
      onKeyDown={handleKeyDown}
      className={cn('inline-flex items-center gap-1 p-1 bg-secondary/50 rounded-lg', className)}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(
            child as React.ReactElement<any>,
            { _value, _onValueChange, _tabsId },
          );
        }
        return child;
      })}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  _value?: string;
  _onValueChange?: (value: string) => void;
  _tabsId?: string;
}

function TabsTrigger({ value, children, className, _value, _onValueChange, _tabsId }: TabsTriggerProps) {
  const isActive = _value === value;
  return (
    <button
      type="button"
      role="tab"
      id={`${_tabsId}-tab-${value}`}
      aria-selected={isActive}
      aria-controls={`${_tabsId}-panel-${value}`}
      tabIndex={isActive ? 0 : -1}
      data-value={value}
      onClick={() => _onValueChange?.(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isActive
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground',
        className,
      )}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  _value?: string;
  _tabsId?: string;
}

function TabsContent({ value, children, className, _value, _tabsId }: TabsContentProps) {
  if (_value !== value) return null;
  return (
    <div
      role="tabpanel"
      id={`${_tabsId}-panel-${value}`}
      aria-labelledby={`${_tabsId}-tab-${value}`}
      tabIndex={0}
      className={cn('mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', className)}
    >
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
