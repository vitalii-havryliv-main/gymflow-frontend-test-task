import React from 'react';

type Mode = 'light' | 'dark';

type Theme = {
  mode: Mode;
  colors: {
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    primary: string;
    danger: string;
  };
};

const light: Theme = {
  mode: 'light',
  colors: {
    background: '#ffffff',
    surface: '#ffffff',
    textPrimary: '#111827',
    textSecondary: '#374151',
    border: '#e5e7eb',
    primary: '#111827',
    danger: '#ef4444',
  },
};

const dark: Theme = {
  mode: 'dark',
  colors: {
    background: '#000000',
    surface: '#0b0b0b',
    textPrimary: '#ffffff',
    textSecondary: '#d1d5db',
    border: '#2a2a2a',
    primary: '#ffffff',
    danger: '#ef4444',
  },
};

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
    const t = value.theme;
    const r = document.documentElement;
    r.style.setProperty('--background', t.colors.background);
    r.style.setProperty('--surface', t.colors.surface);
    r.style.setProperty('--text-primary', t.colors.textPrimary);
    r.style.setProperty('--text-secondary', t.colors.textSecondary);
    r.style.setProperty('--border', t.colors.border);
    r.style.setProperty('--primary', t.colors.primary);
    r.style.setProperty('--danger', '#ef4444');
    r.style.setProperty(
      '--button-text',
      t.mode === 'dark' ? '#000000' : '#ffffff'
    );
    r.style.setProperty('--chip-bg', t.mode === 'dark' ? '#111319' : '#f1f5f9');
    r.style.setProperty(
      '--icon-filter',
      t.mode === 'dark' ? 'invert(1) brightness(1.2)' : 'none'
    );

    // Theme-aware app-like gradients (purple-focused)
    const lightBg =
      'radial-gradient(70rem 50rem at 5% -10%, rgba(196,181,253,0.40), transparent 55%),\
       radial-gradient(60rem 45rem at 105% 0%, rgba(233,213,255,0.30), transparent 55%),\
       radial-gradient(80rem 60rem at 50% 120%, rgba(186,230,253,0.16), transparent 60%)';
    const darkBg =
      'radial-gradient(70rem 50rem at 5% -10%, rgba(168,85,247,0.42), transparent 55%),\
       radial-gradient(60rem 45rem at 110% 0%, rgba(99,102,241,0.28), transparent 55%),\
       radial-gradient(85rem 65rem at 50% 120%, rgba(236,72,153,0.20), transparent 60%)';
    r.style.setProperty('--app-bg', t.mode === 'dark' ? darkBg : lightBg);
    document.body.style.backgroundColor = t.colors.background; // base color under gradients
    document.body.style.color = t.colors.textPrimary;
    window.localStorage.setItem('theme-mode', value.mode);
  }, [value.theme, value.mode]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const ctx = React.useContext(ThemeCtx);
  if (!ctx) throw new Error('useTheme missing');
  return ctx;
}

export function ThemeToggle() {
  const { mode, toggle } = useTheme();
  const icon = mode === 'dark' ? '🌙' : '☀️';
  return (
    <button
      onClick={toggle}
      className="rounded-full hover:scale-115 border px-2.5 py-1 text-lg border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] will-change-transform transition-transform duration-200 active:scale-95"
      aria-label="Toggle theme"
    >
      <span
        className={`inline-block transition-transform duration-300  ${
          mode === 'dark' ? 'rotate-0' : 'rotate-180'
        }`}
      >
        {icon}
      </span>
    </button>
  );
}
