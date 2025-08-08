import React from 'react';

export function LabeledField({
  label,
  children,
  error,
}: React.PropsWithChildren<{ label: string; error?: string }>) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {children}
      {error && <small className="text-sm text-red-600">{error}</small>}
    </label>
  );
}
