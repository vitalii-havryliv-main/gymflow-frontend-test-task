import React from 'react';
import { applyThemeToDOM } from './theme/applyTheme';
import { dark, light } from './theme/tokens';
import type { Mode, Theme } from './theme/types';

const ThemeCtx = React.createContext<{
  theme: Theme;
  mode: Mode;
  toggle: () => void;
} | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const getInitial = (): Mode => {
    if (typeof window === 'undefined') return 'light';
    const stored = window.localStorage.getItem('theme-mode') as Mode | null;
    if (stored === 'light' || stored === 'dark') return stored;
    const prefersDark = window.matchMedia?.(
      '(prefers-color-scheme: dark)'
    ).matches;
    return prefersDark ? 'dark' : 'light';
  };
  const [mode, setMode] = React.useState<Mode>(getInitial);
  const value = React.useMemo(
    () => ({
      theme: mode === 'dark' ? dark : light,
      mode,
      toggle: () => setMode((m) => (m === 'dark' ? 'light' : 'dark')),
    }),
    [mode]
  );

  React.useEffect(() => {
    applyThemeToDOM(value.theme, value.mode);
    window.localStorage.setItem('theme-mode', value.mode);
  }, [value.theme, value.mode]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const ctx = React.useContext(ThemeCtx);
  if (!ctx) throw new Error('useTheme missing');
  return ctx;
}
