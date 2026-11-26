import 'server-only';
import { z } from 'zod';
import { apiRequest } from '@/lib/api/api-client';
import {
  type Booking,
  bookingSchema,
  type GymClass,
  gymClassSchema,
} from '../schemas/class-schema';

/** Sem período, a API lista a partir de hoje. */
export function fetchUpcomingClasses(): Promise<GymClass[]> {
  return apiRequest('/classes', { schema: z.array(gymClassSchema) });
}

export function fetchMyBookings(from: string): Promise<Booking[]> {
  return apiRequest(`/bookings/me?from=${from}`, { schema: z.array(bookingSchema) });
}

export function bookClass(classId: string): Promise<Booking> {
  return apiRequest(`/classes/${classId}/bookings`, { method: 'POST', schema: bookingSchema });
}

export function cancelBooking(classId: string): Promise<null> {
  return apiRequest(`/classes/${classId}/bookings/me`, { method: 'DELETE', schema: z.null() });
}
