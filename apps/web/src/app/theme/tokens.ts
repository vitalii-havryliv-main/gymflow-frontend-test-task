import type { Theme } from './types';

export const light: Theme = {
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

export const dark: Theme = {
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

