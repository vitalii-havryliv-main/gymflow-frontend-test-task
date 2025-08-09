import React from 'react';
import type { UserRole } from 'shared-types';
import ChevronDown from './icons/ChevronDown';

type RoleSelectProps = {
  value: UserRole;
  onChange: (value: UserRole) => void;
  hasError?: boolean;
};

export function RoleSelect({ value, onChange, hasError }: RoleSelectProps) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  function select(role: UserRole) {
    onChange(role);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`appearance-none rounded-md border pl-3 pr-10 py-2 w-full text-left text-[var(--text-primary)] bg-[var(--surface)] outline-none focus:ring-2 focus:ring-[var(--primary)] ${
          hasError ? 'border-[var(--danger)]' : 'border-[var(--border)]'
        }`}
      >
        {value === 'STAFF' ? 'Staff' : 'Member'}
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
      </button>

      {open && (
        <ul
          role="listbox"
          tabIndex={-1}
          className="absolute z-20 mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] shadow-lg"
        >
          {(['STAFF', 'MEMBER'] as const).map((role) => (
            <li
              key={role}
              role="option"
              aria-selected={value === role}
              tabIndex={0}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                select(role);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  select(role);
                }
              }}
              className={`px-3 py-2 cursor-pointer hover:bg-[var(--border)] ${
                value === role ? 'text-[var(--primary)]' : ''
              }`}
            >
              {role === 'STAFF' ? 'Staff' : 'Member'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RoleSelect;
