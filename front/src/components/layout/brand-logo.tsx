import { Dumbbell } from 'lucide-react';

export function BrandLogo() {
  return (
    <span className="flex items-center gap-2 font-semibold tracking-tight">
      <Dumbbell className="size-5 text-primary" aria-hidden />
      gymflow
    </span>
  );
}
