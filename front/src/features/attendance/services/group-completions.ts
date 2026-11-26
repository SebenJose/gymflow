import type { Completion } from '@/features/workouts';

export type ActivityDay = { day: string; completions: Completion[] };

/** Agrupa por dia; a API já devolve da conclusão mais recente para a mais antiga. */
export function groupCompletionsByDay(completions: readonly Completion[]): ActivityDay[] {
  const days = new Map<string, Completion[]>();
  for (const completion of completions) {
    days.set(completion.completedOn, [...(days.get(completion.completedOn) ?? []), completion]);
  }
  return [...days].map(([day, dayCompletions]) => ({ day, completions: dayCompletions }));
}
