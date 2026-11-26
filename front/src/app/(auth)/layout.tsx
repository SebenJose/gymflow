import { BrandLogo } from '@/components/layout/brand-logo';
import { FadeIn } from '@/components/ui/fade-in';

export default function AuthLayout({ children }: LayoutProps<'/'>) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <FadeIn className="flex w-full max-w-sm flex-col gap-8">
        <BrandLogo />
        {children}
      </FadeIn>
    </main>
  );
}
