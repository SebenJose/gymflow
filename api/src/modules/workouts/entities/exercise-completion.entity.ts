import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { WorkoutExercise } from './workout-exercise.entity.js';
import { Workout } from './workout.entity.js';

/**
 * Registro de que o aluno concluiu um exercício em um dia.
 * Guarda uma cópia do que estava prescrito, para o histórico não mudar quando a ficha for
 * editada ou removida (as referências viram nulas, o registro fica).
 * O índice único impede concluir o mesmo exercício duas vezes no mesmo dia.
 */
@Entity('exercise_completions')
@Index('uq_exercise_completions_exercise_day', ['exerciseId', 'completedOn'], {
  unique: true,
  where: '"exercise_id" IS NOT NULL',
})
export class ExerciseCompletion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Relation<User>;

  @Column({ name: 'workout_id', type: 'uuid', nullable: true })
  workoutId: string | null;

  @ManyToOne(() => Workout, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'workout_id' })
  workout: Relation<Workout> | null;

  @Column({ name: 'exercise_id', type: 'uuid', nullable: true })
  exerciseId: string | null;

  @ManyToOne(() => WorkoutExercise, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'exercise_id' })
  exercise: Relation<WorkoutExercise> | null;

  @Column({ name: 'workout_name', length: 80 })
  workoutName: string;

  @Column({ name: 'exercise_name', length: 80 })
  exerciseName: string;

  @Column({ type: 'integer' })
  sets: number;

  @Column({ type: 'integer' })
  reps: number;

  @Column({ name: 'load_kg', type: 'real', nullable: true })
  loadKg: number | null;

  /** Dia da conclusão no fuso da academia. */
  @Column({ name: 'completed_on', type: 'date' })
  completedOn: string;

  @Column({ name: 'completed_at', type: 'timestamptz' })
  completedAt: Date;
}

export type NewExerciseCompletion = Omit<
  ExerciseCompletion,
  'id' | 'student' | 'workout' | 'exercise'
>;
