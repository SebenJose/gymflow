import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Workout } from './workout.entity.js';

/** Exercício previsto em uma ficha, na ordem dada por `position`. */
@Entity('workout_exercises')
export class WorkoutExercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'workout_id', type: 'uuid' })
  workoutId: string;

  @ManyToOne(() => Workout, (workout) => workout.exercises, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workout_id' })
  workout: Relation<Workout>;

  @Column({ type: 'integer' })
  position: number;

  @Column({ length: 80 })
  name: string;

  @Column({ type: 'integer' })
  sets: number;

  @Column({ type: 'integer' })
  reps: number;

  @Column({ name: 'load_kg', type: 'real', nullable: true })
  loadKg: number | null;

  @Column({ name: 'rest_seconds', type: 'integer', nullable: true })
  restSeconds: number | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  notes: string | null;
}

export type ExerciseData = Pick<
  WorkoutExercise,
  'name' | 'sets' | 'reps' | 'loadKg' | 'restSeconds' | 'notes'
>;
