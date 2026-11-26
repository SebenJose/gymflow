import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/page-header';
import { requireUser } from '@/features/auth';
import { ClassSchedule, fetchMyBookings, fetchUpcomingClasses } from '@/features/classes';
import { businessToday } from '@/lib/dates';

export const metadata: Metadata = { title: 'Aulas · gymflow' };

export default async function ClassesPage() {
  const user = await requireUser();
  const isStudent = user.role === 'student';
  const [classes, bookings] = await Promise.all([
    fetchUpcomingClasses(),
    isStudent ? fetchMyBookings(businessToday()) : Promise.resolve([]),
  ]);
  const bookedClassIds = isStudent ? new Set(bookings.map((booking) => booking.class.id)) : null;
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Aulas coletivas"
        description={
          isStudent
            ? 'Inscreva-se nas próximas aulas ou cancele enquanto elas não começaram.'
            : 'Agenda das próximas aulas e ocupação das turmas.'
        }
      />
      <ClassSchedule classes={classes} bookedClassIds={bookedClassIds} now={new Date()} />
    </div>
  );
}
