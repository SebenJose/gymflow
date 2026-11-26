import { z } from 'zod';

export const gymClassSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  instructor: z.object({ id: z.string(), name: z.string() }).nullable(),
  startsAt: z.string(),
  endsAt: z.string(),
  durationMinutes: z.number().int(),
  capacity: z.number().int(),
  bookedCount: z.number().int(),
  availableSpots: z.number().int(),
});

export type GymClass = z.infer<typeof gymClassSchema>;

export const bookingSchema = z.object({
  id: z.string(),
  bookedAt: z.string(),
  attended: z.boolean().nullable(),
  class: gymClassSchema,
});

export type Booking = z.infer<typeof bookingSchema>;

export const bookingChangeSchema = z.object({ classId: z.uuid(), book: z.boolean() });
