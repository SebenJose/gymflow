import type { User } from '../../users/entities/user.entity.js';
import type { Workout } from '../entities/workout.entity.js';
import { ExerciseResponseDto } from './exercise-response.dto.js';

type PersonSummary = { id: string; name: string };

const toPerson = (user: User): PersonSummary => ({ id: user.id, name: user.name });

/** Espera a ficha carregada com `student`, `instructor` e `exercises` (já ordenados). */
export class WorkoutResponseDto {
  readonly id: string;
  readonly name: string;
  readonly notes: string | null;
  readonly student: PersonSummary;
  readonly instructor: PersonSummary | null;
  readonly exercises: ExerciseResponseDto[];
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(workout: Workout) {
    this.id = workout.id;
    this.name = workout.name;
    this.notes = workout.notes;
    this.student = toPerson(workout.student);
    this.instructor = workout.instructor === null ? null : toPerson(workout.instructor);
    this.exercises = workout.exercises.map((exercise) => new ExerciseResponseDto(exercise));
    this.createdAt = workout.createdAt;
    this.updatedAt = workout.updatedAt;
  }
}
