import { redirect } from 'next/navigation';
import { ROUTES } from '@/lib/routes';

/** Sem sessão, o proxy já manda para o login antes de chegar aqui. */
export default function RootPage() {
  redirect(ROUTES.home);
}
