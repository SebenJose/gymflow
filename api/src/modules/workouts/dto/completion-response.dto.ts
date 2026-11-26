import type { ExerciseCompletion } from '../entities/exercise-completion.entity.js';

export class CompletionResponseDto {
  readonly id: string;
  readonly studentId: string;
  readonly workoutId: string | null;
  readonly exerciseId: string | null;
  readonly workoutName: string;
  readonly exerciseName: string;
  readonly sets: number;
  readonly reps: number;
  readonly loadKg: number | null;
  readonly completedOn: string;
  readonly completedAt: Date;

  constructor(completion: ExerciseCompletion) {
    this.id = completion.id;
    this.studentId = completion.studentId;
    this.workoutId = completion.workoutId;
    this.exerciseId = completion.exerciseId;
    this.workoutName = completion.workoutName;
    this.exerciseName = completion.exerciseName;
    this.sets = completion.sets;
    this.reps = completion.reps;
    this.loadKg = completion.loadKg;
    this.completedOn = completion.completedOn;
    this.completedAt = completion.completedAt;
  }
}
