import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type BadgeTone = 'neutral' | 'success' | 'danger' | 'primary';

type BadgeProps = { tone?: BadgeTone; children: ReactNode };

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'border-border text-muted',
  success: 'border-success/40 text-success',
  danger: 'border-danger/40 text-danger',
  primary: 'border-primary/40 text-primary',
};

export function Badge({ tone = 'neutral', children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
        TONE_CLASSES[tone],
      )}
    >
      {children}
    </span>
  );
}
