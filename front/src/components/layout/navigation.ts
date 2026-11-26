import {
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  CreditCard,
  Dumbbell,
  House,
} from 'lucide-react';
import type { UserRole } from '@/features/auth';
import { ROUTES } from '@/lib/routes';
import type { NavItem } from './nav-item';

const HOME: NavItem = { href: ROUTES.home, label: 'Início', icon: House };
const WORKOUTS: NavItem = { href: ROUTES.workouts, label: 'Treinos', icon: Dumbbell };
const CLASSES: NavItem = { href: ROUTES.classes, label: 'Aulas', icon: CalendarDays };
const ATTENDANCE: NavItem = {
  href: ROUTES.attendance,
  label: 'Frequência',
  icon: CalendarCheck,
};
const PLANS: NavItem = { href: ROUTES.plans, label: 'Planos', icon: CreditCard };
const SUBSCRIPTIONS: NavItem = {
  href: ROUTES.subscriptions,
  label: 'Matrículas',
  icon: ClipboardList,
};

/** Itens da barra lateral por papel; cada tela nova entra aqui junto com a rota. */
export const NAVIGATION: Record<UserRole, readonly NavItem[]> = {
  student: [HOME, WORKOUTS, CLASSES, ATTENDANCE, PLANS],
  instructor: [HOME, WORKOUTS, CLASSES],
  admin: [HOME, SUBSCRIPTIONS, PLANS, WORKOUTS, CLASSES],
};
