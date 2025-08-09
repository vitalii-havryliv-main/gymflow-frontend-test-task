export type Mode = 'light' | 'dark';

export type Theme = {
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

