import { businessDayOf, formatTime } from '@/lib/dates';
import type { ClassFormInput } from '../schemas/class-form-schema';
import type { GymClass } from '../schemas/class-schema';

export const EMPTY_CLASS_FORM: ClassFormInput = {
  name: '',
  description: '',
  instructorId: '',
  date: '',
  time: '',
  durationMinutes: '60',
  capacity: '20',
};

/** Aula da API → valores do formulário (data e hora no fuso da academia). */
export function toClassFormInput(gymClass: GymClass): ClassFormInput {
  return {
    name: gymClass.name,
    description: gymClass.description ?? '',
    instructorId: gymClass.instructor?.id ?? '',
    date: businessDayOf(gymClass.startsAt),
    time: formatTime(gymClass.startsAt),
    durationMinutes: String(gymClass.durationMinutes),
    capacity: String(gymClass.capacity),
  };
}
