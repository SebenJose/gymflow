import 'server-only';
import { apiRequest } from '@/lib/api/api-client';
import { type AttendanceHistory, attendanceHistorySchema } from '../schemas/attendance-schema';

export function fetchMyAttendance(from: string, to: string): Promise<AttendanceHistory> {
  return apiRequest(`/attendance/me?from=${from}&to=${to}`, { schema: attendanceHistorySchema });
}
