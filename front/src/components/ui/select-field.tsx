import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

export type SelectOption = { value: string; label: string };

type SelectFieldProps = ComponentProps<'select'> & {
  label: string;
  options: readonly SelectOption[];
  placeholder?: string;
  error?: string | undefined;
};

export function SelectField({
  label,
  options,
  placeholder,
  error,
  id,
  name,
  className,
  ...props
}: SelectFieldProps) {
  const fieldId = id ?? name;
  const errorId = `${fieldId}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-medium">
        {label}
      </label>
      <select
        id={fieldId}
        name={name}
        aria-invalid={error !== undefined}
        aria-describedby={error === undefined ? undefined : errorId}
        className={cn(
          'h-10 rounded-md border bg-background px-3 text-sm aria-invalid:border-danger',
          className,
        )}
        {...props}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map(({ value, label: optionLabel }) => (
          <option key={value} value={value}>
            {optionLabel}
          </option>
        ))}
      </select>
      {error !== undefined && (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
