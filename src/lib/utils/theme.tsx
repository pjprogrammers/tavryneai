'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

async function syncThemeToFirestore(theme?: Theme, colorTheme?: string) {
  try {
    const { idToken } = useAuthStore.getState();
    if (!idToken) return;
    const body: Record<string, string> = {};
    if (theme) body.theme = theme;
    if (colorTheme) body.colorTheme = colorTheme;
    if (Object.keys(body).length === 0) return;
    await fetch('/api/user/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify(body),
    });
  } catch {
    // Silent fail — theme sync is non-critical
  }
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  setTheme: () => {},
  toggle: () => {},
});

export function applyTheme(t: Theme) {
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(t);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('tavryne-theme') as Theme | null;
    const initial = stored || 'dark';
    setThemeState(initial);
    applyTheme(initial);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem('tavryne-theme', t);
    applyTheme(t);
    const colorTheme = getSavedColorTheme();
    syncThemeToFirestore(t, colorTheme === 'default' ? undefined : colorTheme);
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

/* =========================================================
   🎨 COLOR THEME (orthogonal to light/dark)
========================================================= */

export type ColorThemeId = 'default' | 'forest' | 'ocean' | 'sunset' | 'monochrome' | 'midnight' | 'rose' | 'amber' | 'teal' | 'violet' | 'lime';

export interface ColorTheme {
  id: ColorThemeId;
  label: string;
  colors: Record<string, string>;
}

export const COLOR_THEMES: ColorTheme[] = [
  {
    id: 'default',
    label: 'Default',
    colors: {
      '--primary': '262 83% 58%',
      '--primary-foreground': '0 0% 100%',
      '--ring': '262 83% 58%',
      '--chart-1': '262 83% 58%',
      '--accent-foreground': '262 83% 58%',
      '--primary-fixed': '243 100% 94%',
      '--primary-fixed-dim': '242 100% 88%',
      '--on-primary-fixed': '244 100% 21%',
      '--gradient-from': '262 83% 58%',
      '--gradient-to': '239 84% 67%',
    },
  },
  {
    id: 'forest',
    label: 'Forest',
    colors: {
      '--primary': '142 76% 36%',
      '--primary-foreground': '0 0% 100%',
      '--ring': '142 76% 36%',
      '--chart-1': '142 76% 36%',
      '--accent-foreground': '142 76% 36%',
      '--primary-fixed': '140 78% 94%',
      '--primary-fixed-dim': '138 78% 88%',
      '--on-primary-fixed': '142 100% 21%',
      '--gradient-from': '142 76% 36%',
      '--gradient-to': '160 84% 39%',
    },
  },
  {
    id: 'ocean',
    label: 'Ocean',
    colors: {
      '--primary': '199 89% 48%',
      '--primary-foreground': '0 0% 100%',
      '--ring': '199 89% 48%',
      '--chart-1': '199 89% 48%',
      '--accent-foreground': '199 89% 48%',
      '--primary-fixed': '200 90% 94%',
      '--primary-fixed-dim': '198 88% 88%',
      '--on-primary-fixed': '200 100% 21%',
      '--gradient-from': '199 89% 48%',
      '--gradient-to': '217 89% 61%',
    },
  },
  {
    id: 'sunset',
    label: 'Sunset',
    colors: {
      '--primary': '346 83% 55%',
      '--primary-foreground': '0 0% 100%',
      '--ring': '346 83% 55%',
      '--chart-1': '346 83% 55%',
      '--accent-foreground': '346 83% 55%',
      '--primary-fixed': '345 84% 94%',
      '--primary-fixed-dim': '344 82% 88%',
      '--on-primary-fixed': '346 100% 21%',
      '--gradient-from': '346 83% 55%',
      '--gradient-to': '15 90% 55%',
    },
  },
  {
    id: 'monochrome',
    label: 'Monochrome',
    colors: {
      '--primary': '0 0% 45%',
      '--primary-foreground': '0 0% 100%',
      '--ring': '0 0% 45%',
      '--chart-1': '0 0% 45%',
      '--accent-foreground': '0 0% 55%',
      '--primary-fixed': '0 0% 94%',
      '--primary-fixed-dim': '0 0% 88%',
      '--on-primary-fixed': '0 0% 21%',
      '--gradient-from': '0 0% 45%',
      '--gradient-to': '0 0% 25%',
    },
  },
  {
    id: 'midnight',
    label: 'Midnight',
    colors: {
      '--primary': '230 70% 50%',
      '--primary-foreground': '0 0% 100%',
      '--ring': '230 70% 50%',
      '--chart-1': '230 70% 50%',
      '--accent-foreground': '230 70% 50%',
      '--primary-fixed': '228 72% 94%',
      '--primary-fixed-dim': '226 70% 88%',
      '--on-primary-fixed': '230 100% 21%',
      '--gradient-from': '230 70% 50%',
      '--gradient-to': '260 70% 50%',
    },
  },
  {
    id: 'rose',
    label: 'Rose',
    colors: {
      '--primary': '340 82% 52%',
      '--primary-foreground': '0 0% 100%',
      '--ring': '340 82% 52%',
      '--chart-1': '340 82% 52%',
      '--accent-foreground': '340 82% 52%',
      '--primary-fixed': '340 80% 94%',
      '--primary-fixed-dim': '338 78% 88%',
      '--on-primary-fixed': '340 100% 21%',
      '--gradient-from': '340 82% 52%',
      '--gradient-to': '330 80% 60%',
    },
  },
  {
    id: 'amber',
    label: 'Amber',
    colors: {
      '--primary': '38 92% 50%',
      '--primary-foreground': '0 0% 100%',
      '--ring': '38 92% 50%',
      '--chart-1': '38 92% 50%',
      '--accent-foreground': '38 92% 50%',
      '--primary-fixed': '40 90% 94%',
      '--primary-fixed-dim': '38 88% 88%',
      '--on-primary-fixed': '38 100% 21%',
      '--gradient-from': '38 92% 50%',
      '--gradient-to': '30 85% 55%',
    },
  },
  {
    id: 'teal',
    label: 'Teal',
    colors: {
      '--primary': '180 80% 35%',
      '--primary-foreground': '0 0% 100%',
      '--ring': '180 80% 35%',
      '--chart-1': '180 80% 35%',
      '--accent-foreground': '180 80% 35%',
      '--primary-fixed': '182 82% 94%',
      '--primary-fixed-dim': '180 80% 88%',
      '--on-primary-fixed': '180 100% 21%',
      '--gradient-from': '180 80% 35%',
      '--gradient-to': '190 85% 40%',
    },
  },
  {
    id: 'violet',
    label: 'Violet',
    colors: {
      '--primary': '270 75% 55%',
      '--primary-foreground': '0 0% 100%',
      '--ring': '270 75% 55%',
      '--chart-1': '270 75% 55%',
      '--accent-foreground': '270 75% 55%',
      '--primary-fixed': '268 76% 94%',
      '--primary-fixed-dim': '266 74% 88%',
      '--on-primary-fixed': '270 100% 21%',
      '--gradient-from': '270 75% 55%',
      '--gradient-to': '280 80% 60%',
    },
  },
  {
    id: 'lime',
    label: 'Lime',
    colors: {
      '--primary': '120 60% 40%',
      '--primary-foreground': '0 0% 100%',
      '--ring': '120 60% 40%',
      '--chart-1': '120 60% 40%',
      '--accent-foreground': '120 60% 40%',
      '--primary-fixed': '118 62% 94%',
      '--primary-fixed-dim': '116 60% 88%',
      '--on-primary-fixed': '120 100% 21%',
      '--gradient-from': '120 60% 40%',
      '--gradient-to': '100 65% 45%',
    },
  },
];

const COLOR_THEME_STORAGE_KEY = 'tavryne-color-theme';

export function getSavedColorTheme(): ColorThemeId {
  if (typeof window === 'undefined') return 'default';
  try {
    return (localStorage.getItem(COLOR_THEME_STORAGE_KEY) as ColorThemeId) || 'default';
  } catch {
    return 'default';
  }
}

export function applyColorTheme(themeId: ColorThemeId) {
  const theme = COLOR_THEMES.find((t) => t.id === themeId);
  if (!theme) return;
  const root = document.documentElement;
  for (const [varName, value] of Object.entries(theme.colors)) {
    root.style.setProperty(varName, value);
  }
  try {
    localStorage.setItem(COLOR_THEME_STORAGE_KEY, themeId);
  } catch {}
}

export function useColorTheme() {
  const [currentId, setCurrentId] = useState<ColorThemeId>('default');

  useEffect(() => {
    setCurrentId(getSavedColorTheme());
  }, []);

  const setColorTheme = useCallback((id: ColorThemeId) => {
    applyColorTheme(id);
    setCurrentId(id);
    const stored = localStorage.getItem('tavryne-theme') as Theme | null;
    syncThemeToFirestore(stored || 'dark', id);
  }, []);

  return { colorTheme: currentId, setColorTheme, themes: COLOR_THEMES };
}
