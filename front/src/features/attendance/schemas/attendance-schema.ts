import { z } from 'zod';
import { bookingSchema } from '@/features/classes';

export const attendanceSummarySchema = z.object({
  totalClasses: z.number().int(),
  attended: z.number().int(),
  missed: z.number().int(),
  notRecorded: z.number().int(),
  attendancePercent: z.number().nullable(),
});

export type AttendanceSummary = z.infer<typeof attendanceSummarySchema>;

/** Só aulas que já começaram, das mais recentes para as mais antigas. */
export const attendanceHistorySchema = z.object({
  summary: attendanceSummarySchema,
  classes: z.array(bookingSchema),
});

export type AttendanceHistory = z.infer<typeof attendanceHistorySchema>;
