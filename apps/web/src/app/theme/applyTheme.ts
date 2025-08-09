import type { Theme, Mode } from './types';

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
  r.style.setProperty('--icon-filter', mode === 'dark' ? 'invert(1) brightness(1.2)' : 'none');

  const lightBg =
    'radial-gradient(70rem 50rem at 5% -10%, rgba(196,181,253,0.40), transparent 55%),\
     radial-gradient(60rem 45rem at 105% 0%, rgba(233,213,255,0.30), transparent 55%),\
     radial-gradient(80rem 60rem at 50% 120%, rgba(186,230,253,0.16), transparent 60%)';
  const darkBg =
    'radial-gradient(70rem 50rem at 5% -10%, rgba(168,85,247,0.42), transparent 55%),\
     radial-gradient(60rem 45rem at 110% 0%, rgba(99,102,241,0.28), transparent 55%),\
     radial-gradient(85rem 65rem at 50% 120%, rgba(236,72,153,0.20), transparent 60%)';
  r.style.setProperty('--app-bg', mode === 'dark' ? darkBg : lightBg);

  document.body.style.backgroundColor = theme.colors.background;
  document.body.style.color = theme.colors.textPrimary;
}

