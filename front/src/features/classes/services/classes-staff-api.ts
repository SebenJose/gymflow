import 'server-only';
import { z } from 'zod';
import { apiRequest } from '@/lib/api/api-client';
import {
  type ClassFormValues,
  type RosterEntry,
  rosterEntrySchema,
} from '../schemas/class-form-schema';
import { type GymClass, gymClassSchema } from '../schemas/class-schema';
import { type Instructor, instructorSchema } from '../schemas/instructor-schema';

export function fetchClassesFrom(from: string): Promise<GymClass[]> {
  return apiRequest(`/classes?from=${from}`, { schema: z.array(gymClassSchema) });
}

export function fetchClass(id: string): Promise<GymClass> {
  return apiRequest(`/classes/${id}`, { schema: gymClassSchema });
}

export function fetchRoster(classId: string): Promise<RosterEntry[]> {
  return apiRequest(`/classes/${classId}/bookings`, { schema: z.array(rosterEntrySchema) });
}

/** Só o admin pode listar instrutores; para o instrutor, a aula fica com ele mesmo. */
export function fetchInstructors(): Promise<Instructor[]> {
  return apiRequest('/users?role=instructor', { schema: z.array(instructorSchema) });
}

export function createClass(values: ClassFormValues): Promise<GymClass> {
  return apiRequest('/classes', { method: 'POST', body: values, schema: gymClassSchema });
}

export function updateClass(id: string, changes: Partial<ClassFormValues>): Promise<GymClass> {
  return apiRequest(`/classes/${id}`, { method: 'PATCH', body: changes, schema: gymClassSchema });
}

export function deleteClass(id: string): Promise<null> {
  return apiRequest(`/classes/${id}`, { method: 'DELETE', schema: z.null() });
}

export function markAttendance(
  classId: string,
  bookingId: string,
  attended: boolean,
): Promise<RosterEntry> {
  return apiRequest(`/classes/${classId}/bookings/${bookingId}`, {
    method: 'PATCH',
    body: { attended },
    schema: rosterEntrySchema,
  });
}
