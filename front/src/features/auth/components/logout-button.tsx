import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logoutAction } from '../services/auth-actions';

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="ghost" className="w-full justify-start px-3">
        <LogOut className="size-4" aria-hidden />
        Sair
      </Button>
    </form>
  );
}
