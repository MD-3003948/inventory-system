import type { ReactNode } from "react";

export function FormField({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1 text-xs uppercase tracking-wide text-term-amber ${className ?? ""}`}>
      {label}
      {children}
    </label>
  );
}
