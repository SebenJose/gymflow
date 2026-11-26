import type { GymClass } from '../entities/gym-class.entity.js';

type PersonSummary = { id: string; name: string };

const MS_PER_MINUTE = 60_000;

/** Espera a aula carregada com `instructor`. */
export class ClassResponseDto {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly instructor: PersonSummary | null;
  readonly startsAt: Date;
  readonly endsAt: Date;
  readonly durationMinutes: number;
  readonly capacity: number;
  readonly bookedCount: number;
  readonly availableSpots: number;

  constructor(gymClass: GymClass) {
    this.id = gymClass.id;
    this.name = gymClass.name;
    this.description = gymClass.description;
    this.instructor =
      gymClass.instructor === null
        ? null
        : { id: gymClass.instructor.id, name: gymClass.instructor.name };
    this.startsAt = gymClass.startsAt;
    this.endsAt = new Date(gymClass.startsAt.getTime() + gymClass.durationMinutes * MS_PER_MINUTE);
    this.durationMinutes = gymClass.durationMinutes;
    this.capacity = gymClass.capacity;
    this.bookedCount = gymClass.bookedCount;
    this.availableSpots = gymClass.capacity - gymClass.bookedCount;
  }
}
