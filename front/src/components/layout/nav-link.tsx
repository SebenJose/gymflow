'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type NavLinkProps = { href: string; label: string; icon: ReactNode };

export function NavLink({ href, label, icon }: NavLinkProps) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm transition',
        active ? 'bg-surface text-foreground' : 'text-muted hover:text-foreground',
      )}
    >
      {icon}
      {label}
    </Link>
  );
}
