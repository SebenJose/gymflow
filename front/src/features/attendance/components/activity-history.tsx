import { Card } from '@/components/ui/card';
import type { Completion } from '@/features/workouts';
import { formatDayLabel } from '@/lib/dates';
import { groupCompletionsByDay } from '../services/group-completions';

type ActivityHistoryProps = { completions: readonly Completion[] };

const describe = ({ sets, reps, loadKg }: Completion): string =>
  `${sets} × ${reps}${loadKg === null ? '' : ` · ${loadKg.toLocaleString('pt-BR')} kg`}`;

export function ActivityHistory({ completions }: ActivityHistoryProps) {
  const days = groupCompletionsByDay(completions);
  return (
    <Card className="flex flex-col gap-4">
      <h2 className="font-medium">Exercícios realizados</h2>
      {days.length === 0 && <p className="text-sm text-muted">Nenhum exercício no período.</p>}
      {days.map(({ day, completions: dayCompletions }) => (
        <section key={day} aria-label={formatDayLabel(day)} className="flex flex-col gap-2">
          <h3 className="text-sm text-muted capitalize">{formatDayLabel(day)}</h3>
          <ul className="flex flex-col gap-1">
            {dayCompletions.map((completion) => (
              <li key={completion.id} className="flex justify-between gap-4 text-sm">
                <span>
                  {completion.exerciseName}{' '}
                  <span className="text-muted">· {completion.workoutName}</span>
                </span>
                <span className="shrink-0 text-muted tabular-nums">{describe(completion)}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </Card>
  );
}
