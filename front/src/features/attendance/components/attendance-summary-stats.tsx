import { Stat } from '@/components/ui/stat';
import type { AttendanceSummary } from '../schemas/attendance-schema';

type AttendanceSummaryStatsProps = { summary: AttendanceSummary };

export function AttendanceSummaryStats({ summary }: AttendanceSummaryStatsProps) {
  const percent = summary.attendancePercent === null ? '—' : `${summary.attendancePercent}%`;
  return (
    <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <Stat label="Presença" value={percent} hint="Sobre as aulas com registro" />
      <Stat label="Aulas" value={String(summary.totalClasses)} />
      <Stat label="Presenças" value={String(summary.attended)} />
      <Stat label="Faltas" value={String(summary.missed)} />
    </dl>
  );
}
