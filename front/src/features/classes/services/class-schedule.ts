import { businessDayOf } from '@/lib/dates';
import type { GymClass } from '../schemas/class-schema';

export type ClassDay = { day: string; classes: GymClass[] };

/** Agrupa por dia no fuso da academia, mantendo a ordem de horário que vem da API. */
export function groupByDay(classes: readonly GymClass[]): ClassDay[] {
  const days = new Map<string, GymClass[]>();
  for (const gymClass of classes) {
    const day = businessDayOf(gymClass.startsAt);
    days.set(day, [...(days.get(day) ?? []), gymClass]);
  }
  return [...days].map(([day, dayClasses]) => ({ day, classes: dayClasses }));
}

export function hasStarted(gymClass: GymClass, now: Date): boolean {
  return new Date(gymClass.startsAt) <= now;
}
