import { CreditCard, House } from 'lucide-react';
import type { UserRole } from '@/features/auth';
import { ROUTES } from '@/lib/routes';
import type { NavItem } from './nav-item';

const HOME: NavItem = { href: ROUTES.home, label: 'Início', icon: House };
const PLANS: NavItem = { href: ROUTES.plans, label: 'Planos', icon: CreditCard };

/** Itens da barra lateral por papel; cada tela nova entra aqui junto com a rota. */
export const NAVIGATION: Record<UserRole, readonly NavItem[]> = {
  student: [HOME, PLANS],
  instructor: [HOME],
  admin: [HOME],
};
