import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { formatWeekday } from '@/lib/dates';
import { ROUTES } from '@/lib/routes';
import type { GymClass } from '../schemas/class-schema';
import { bookingStateOf } from '../services/booking-state';
import { groupByDay } from '../services/class-schedule';
import { BookingButton } from './booking-button';
import { ClassItem } from './class-item';

type ClassScheduleProps = {
  classes: readonly GymClass[];
  /** Aulas em que o aluno está inscrito; `null` para a equipe, que gerencia em vez de se inscrever. */
  bookedClassIds: ReadonlySet<string> | null;
  now: Date;
};

export function ClassSchedule({ classes, bookedClassIds, now }: ClassScheduleProps) {
  if (classes.length === 0) {
    return <p className="text-sm text-muted">Nenhuma aula agendada no período.</p>;
  }
  return (
    <div className="flex flex-col gap-6">
      {groupByDay(classes).map(({ day, classes: dayClasses }) => (
        <Card key={day} aria-labelledby={`day-${day}`}>
          <h2 id={`day-${day}`} className="text-sm font-medium capitalize">
            {formatWeekday(dayClasses[0]?.startsAt ?? day)}
          </h2>
          <ul className="divide-y">
            {dayClasses.map((gymClass) => {
              const booked = bookedClassIds?.has(gymClass.id) ?? false;
              const action =
                bookedClassIds === null ? (
                  <Link
                    href={`${ROUTES.classes}/${gymClass.id}`}
                    className="text-sm text-muted underline underline-offset-4 hover:text-foreground"
                    aria-label={`Gerenciar ${gymClass.name}`}
                  >
                    Gerenciar
                  </Link>
                ) : (
                  <BookingButton
                    classId={gymClass.id}
                    className={gymClass.name}
                    state={bookingStateOf(gymClass, booked, now)}
                  />
                );
              return (
                <ClassItem key={gymClass.id} gymClass={gymClass} booked={booked} action={action} />
              );
            })}
          </ul>
        </Card>
      ))}
    </div>
  );
}
