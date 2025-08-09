import React from 'react';

export function LabeledField({
  label,
  children,
  error,
}: React.PropsWithChildren<{ label: string; error?: string }>) {
  return (
    <label className="grid gap-2">
      <span
        className="text-sm font-medium"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </span>
      {children}
      {error && <small className="text-sm text-[var(--danger)]">{error}</small>}
    </label>
  );
}
