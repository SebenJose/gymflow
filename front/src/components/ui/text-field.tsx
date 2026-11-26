import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

type TextFieldProps = ComponentProps<'input'> & {
  label: string;
  error?: string | undefined;
};

/** Input com label e mensagem de erro ligadas por `id`/`aria-describedby`. */
export function TextField({ label, error, id, name, className, ...props }: TextFieldProps) {
  const inputId = id ?? name;
  const errorId = `${inputId}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        aria-invalid={error !== undefined}
        aria-describedby={error === undefined ? undefined : errorId}
        className={cn(
          'h-10 rounded-md border bg-background px-3 text-sm placeholder:text-muted aria-invalid:border-danger',
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
