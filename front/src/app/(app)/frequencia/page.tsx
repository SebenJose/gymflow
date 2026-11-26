import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/page-header';
import {
  ActivityHistory,
  AttendanceSummaryStats,
  ClassHistory,
  fetchMyAttendance,
} from '@/features/attendance';
import { requireUser } from '@/features/auth';
import { fetchMyCompletions } from '@/features/workouts';
import { addDays, businessToday } from '@/lib/dates';

export const metadata: Metadata = { title: 'Frequência · gymflow' };

const PERIOD_DAYS = 30;

export default async function AttendancePage() {
  await requireUser(['student']);
  const to = businessToday();
  const from = addDays(to, -(PERIOD_DAYS - 1));
  const [attendance, completions] = await Promise.all([
    fetchMyAttendance(from, to),
    fetchMyCompletions({ from, to }),
  ]);
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Frequência"
        description={`Suas aulas e exercícios dos últimos ${PERIOD_DAYS} dias.`}
      />
      <AttendanceSummaryStats summary={attendance.summary} />
      <div className="grid gap-4 lg:grid-cols-2">
        <ClassHistory bookings={attendance.classes} />
        <ActivityHistory completions={completions} />
      </div>
    </div>
  );
}
