import Link from 'next/link';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

/** Link com aparência do botão primário, para ações que levam a outra página. */
export function LinkButton({ className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        'inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90',
        className,
      )}
      {...props}
    />
  );
}
