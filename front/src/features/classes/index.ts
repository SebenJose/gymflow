// Inclui funções de servidor (`server-only`): importe este index só em Server Components.
export { ClassSchedule } from './components/class-schedule';
export { fetchMyBookings, fetchUpcomingClasses } from './services/classes-api';
export { bookingSchema } from './schemas/class-schema';
export type { Booking } from './schemas/class-schema';
