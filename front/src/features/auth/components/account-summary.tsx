import { ROLE_LABELS, type SessionUser } from '../schemas/session-user-schema';
import { LogoutButton } from './logout-button';

type AccountSummaryProps = { user: SessionUser };

export function AccountSummary({ user }: AccountSummaryProps) {
  return (
    <div className="flex items-center justify-between gap-2 md:flex-col md:items-stretch">
      <div className="min-w-0 px-3">
        <p className="truncate text-sm font-medium">{user.name}</p>
        <p className="text-xs text-muted">{ROLE_LABELS[user.role]}</p>
      </div>
      <LogoutButton />
    </div>
  );
}
