import type { ReactNode } from 'react';
import { BrandLogo } from './brand-logo';
import type { NavItem } from './nav-item';
import { SidebarNav } from './sidebar-nav';

type AppShellProps = {
  navigation: readonly NavItem[];
  account: ReactNode;
  children: ReactNode;
};

/** Barra lateral no desktop; no celular vira um cabeçalho com a navegação rolável. */
export function AppShell({ navigation, account, children }: AppShellProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col md:flex-row">
      <aside className="flex flex-col gap-4 border-b p-4 md:sticky md:top-0 md:h-dvh md:w-60 md:border-r md:border-b-0">
        <BrandLogo />
        <SidebarNav items={navigation} />
        <div className="md:mt-auto">{account}</div>
      </aside>
      <main className="flex-1 px-4 py-8 md:px-10">
        <div className="mx-auto w-full max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
