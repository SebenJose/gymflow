import { Plus } from 'lucide-react';
import type { Metadata } from 'next';
import { LinkButton } from '@/components/ui/link-button';
import { PageHeader } from '@/components/ui/page-header';
import { requireUser } from '@/features/auth';
import {
  ClassSchedule,
  fetchClassesFrom,
  fetchMyBookings,
  fetchUpcomingClasses,
} from '@/features/classes';
import { addDays, businessToday } from '@/lib/dates';
import { ROUTES } from '@/lib/routes';

export const metadata: Metadata = { title: 'Aulas · gymflow' };

/** A equipe vê também a última semana, para registrar a presença das aulas recentes. */
const STAFF_PAST_DAYS = 7;

export default async function ClassesPage() {
  const user = await requireUser();
  const today = businessToday();
  if (user.role === 'student') {
    const [classes, bookings] = await Promise.all([fetchUpcomingClasses(), fetchMyBookings(today)]);
    return (
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Aulas coletivas"
          description="Inscreva-se nas próximas aulas ou cancele enquanto elas não começaram."
        />
        <ClassSchedule
          classes={classes}
          bookedClassIds={new Set(bookings.map((booking) => booking.class.id))}
          now={new Date()}
        />
      </div>
    );
  }

  const classes = await fetchClassesFrom(addDays(today, -STAFF_PAST_DAYS));
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title="Aulas coletivas"
          description={`Agenda a partir dos últimos ${STAFF_PAST_DAYS} dias, com a ocupação das turmas.`}
        />
        <LinkButton href={`${ROUTES.classes}/nova`}>
          <Plus className="size-4" aria-hidden />
          Nova aula
        </LinkButton>
      </div>
      <ClassSchedule classes={classes} bookedClassIds={null} now={new Date()} />
    </div>
  );
}
