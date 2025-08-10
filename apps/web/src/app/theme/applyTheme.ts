import type { Mode, Theme } from './types';

export function applyThemeToDOM(theme: Theme, mode: Mode) {
  const r = document.documentElement;
  r.style.setProperty('--background', theme.colors.background);
  r.style.setProperty('--surface', theme.colors.surface);
  r.style.setProperty('--text-primary', theme.colors.textPrimary);
  r.style.setProperty('--text-secondary', theme.colors.textSecondary);
  r.style.setProperty('--border', theme.colors.border);
  r.style.setProperty('--primary', theme.colors.primary);
  r.style.setProperty('--danger', '#ef4444');
  r.style.setProperty('--button-text', mode === 'dark' ? '#000000' : '#ffffff');
  r.style.setProperty('--chip-bg', mode === 'dark' ? '#111319' : '#f1f5f9');
  r.style.setProperty(
    '--icon-filter',
    mode === 'dark' ? 'invert(1) brightness(1.2)' : 'none'
  );

  const lightBg =
    'radial-gradient(80rem 55rem at 10% 0%, rgba(167,139,250,0.35), transparent 55%),\
     ' +
    'radial-gradient(70rem 50rem at 95% 5%, rgba(240,171,252,0.22), transparent 55%),\
     ' +
    'radial-gradient(95rem 75rem at 50% 115%, rgba(240,171,252,0.22), transparent 60%)';
  const darkBg =
    'radial-gradient(80rem 55rem at 8% -5%, rgba(168,85,247,0.40), transparent 55%),\
     ' +
    'radial-gradient(70rem 50rem at 100% 0%, rgba(79,70,229,0.24), transparent 55%),\
     ' +
    'radial-gradient(95rem 75rem at 50% 115%, rgba(236,72,153,0.18), transparent 60%)';
  r.style.setProperty('--app-bg', mode === 'dark' ? darkBg : lightBg);

  document.body.style.backgroundColor = theme.colors.background;
  document.body.style.color = theme.colors.textPrimary;
}
