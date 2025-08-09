import { useTheme } from '../theme';

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

export default ThemeToggle;
