'use client';
import { useCallback } from 'react';
import { COLOR_THEMES, useColorTheme, type ColorThemeId } from '@/lib/utils/theme';

export function ThemeColorSelector() {
  const { colorTheme, setColorTheme, themes } = useColorTheme();

  return (
    <div>
      <p className="text-sm font-medium text-foreground mb-3">Color theme</p>
      <p className="text-xs text-muted-foreground mb-4">Change the accent color palette</p>
      <div className="flex flex-wrap gap-3">
        {themes.map((t) => (
          <ThemeSwatch
            key={t.id}
            id={t.id}
            label={t.label}
            colors={t.colors}
            active={colorTheme === t.id}
            onSelect={setColorTheme}
          />
        ))}
      </div>
    </div>
  );
}

function ThemeSwatch({
  id,
  label,
  colors,
  active,
  onSelect,
}: {
  id: ColorThemeId;
  label: string;
  colors: Record<string, string>;
  active: boolean;
  onSelect: (id: ColorThemeId) => void;
}) {
  const handleClick = useCallback(() => {
    onSelect(id);
  }, [id, onSelect]);

  const primaryHsl = colors['--primary'] || '262 83% 58%';

  return (
    <button
      onClick={handleClick}
      className="flex flex-col items-center gap-1.5 group"
      aria-label={`Set color theme to ${label}`}
    >
      <div
        className={`h-10 w-10 rounded-full transition-all duration-200 ${
          active ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background' : 'ring-1 ring-border group-hover:ring-muted-foreground/50'
        }`}
        style={{ backgroundColor: `hsl(${primaryHsl})` }}
      />
      <span className={`text-xs ${active ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
        {label}
      </span>
    </button>
  );
}
