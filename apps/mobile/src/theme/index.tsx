import React from 'react';
import { ColorSchemeName, StatusBarStyle, useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark';

export type Theme = {
  mode: ThemeMode;
  colors: {
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    emptyBorder: string;
    primary: string;
    danger: string;
  };
  statusBarStyle: StatusBarStyle;
};

const lightTheme: Theme = {
  mode: 'light',
  colors: {
    background: '#ffffff',
    emptyBorder: '#000000',
    surface: '#ffffff',
    textPrimary: '#111827',
    textSecondary: '#374151',
    border: '#e5e7eb',
    primary: '#111827',
    danger: '#ef4444',
  },
  statusBarStyle: 'dark-content',
};

const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    background: '#000000',
    surface: '#0b0b0b',
    textPrimary: '#ffffff',
    textSecondary: '#d1d5db',
    border: '#2a2a2a',
    emptyBorder: '#ffffff',
    primary: '#ffffff',
    danger: '#ef4444',
  },
  statusBarStyle: 'light-content',
};

type ThemeContextValue = {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
};

const ThemeContext = React.createContext<ThemeContextValue | undefined>(
  undefined
);

function schemeToMode(scheme: ColorSchemeName): ThemeMode {
  return scheme === 'dark' ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const osScheme = useColorScheme();
  const [mode, setMode] = React.useState<ThemeMode>(schemeToMode(osScheme));

  React.useEffect(() => {
    if (osScheme) setMode(schemeToMode(osScheme));
  }, [osScheme]);

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme: mode === 'dark' ? darkTheme : lightTheme,
      mode,
      setMode,
      toggleMode: () => setMode((m) => (m === 'dark' ? 'light' : 'dark')),
    }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
