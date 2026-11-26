import type { WorkoutExercise } from '../entities/workout-exercise.entity.js';

export class ExerciseResponseDto {
  readonly id: string;
  readonly position: number;
  readonly name: string;
  readonly sets: number;
  readonly reps: number;
  readonly loadKg: number | null;
  readonly restSeconds: number | null;
  readonly notes: string | null;

  constructor(exercise: WorkoutExercise) {
    this.id = exercise.id;
    this.position = exercise.position;
    this.name = exercise.name;
    this.sets = exercise.sets;
    this.reps = exercise.reps;
    this.loadKg = exercise.loadKg;
    this.restSeconds = exercise.restSeconds;
    this.notes = exercise.notes;
  }
}
