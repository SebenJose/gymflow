import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

type TextareaFieldProps = ComponentProps<'textarea'> & {
  label: string;
  error?: string | undefined;
};

export function TextareaField({ label, error, id, name, className, ...props }: TextareaFieldProps) {
  const fieldId = id ?? name;
  const errorId = `${fieldId}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-medium">
        {label}
      </label>
      <textarea
        id={fieldId}
        name={name}
        rows={3}
        aria-invalid={error !== undefined}
        aria-describedby={error === undefined ? undefined : errorId}
        className={cn(
          'rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted aria-invalid:border-danger',
          className,
        )}
        {...props}
      />
      {error !== undefined && (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
