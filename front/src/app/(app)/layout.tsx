import { AppShell } from '@/components/layout/app-shell';
import { NAVIGATION } from '@/components/layout/navigation';
import { AccountSummary, requireUser } from '@/features/auth';

export default async function PrivateLayout({ children }: LayoutProps<'/'>) {
  const user = await requireUser();
  return (
    <AppShell navigation={NAVIGATION[user.role]} account={<AccountSummary user={user} />}>
      {children}
    </AppShell>
  );
}
