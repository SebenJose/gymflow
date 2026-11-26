import type { GymClass } from '../schemas/class-schema';
import { hasStarted } from './class-schedule';

/** O que o aluno pode fazer com a aula agora. */
export type BookingState = 'available' | 'booked' | 'full' | 'started';

export function bookingStateOf(gymClass: GymClass, booked: boolean, now: Date): BookingState {
  if (hasStarted(gymClass, now)) {
    return 'started';
  }
  if (booked) {
    return 'booked';
  }
  return gymClass.availableSpots === 0 ? 'full' : 'available';
}
