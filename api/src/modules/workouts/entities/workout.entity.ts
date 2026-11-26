import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { WorkoutExercise } from './workout-exercise.entity.js';

/** Ficha de treino de um aluno, montada por um instrutor. */
@Entity('workouts')
export class Workout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Relation<User>;

  /** Quem montou a ficha. Fica nulo se o instrutor for removido, sem apagar a ficha do aluno. */
  @Column({ name: 'instructor_id', type: 'uuid', nullable: true })
  instructorId: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'instructor_id' })
  instructor: Relation<User> | null;

  @Column({ length: 80 })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  notes: string | null;

  @OneToMany(() => WorkoutExercise, (exercise) => exercise.workout)
  exercises: Relation<WorkoutExercise[]>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

export type NewWorkout = Pick<Workout, 'studentId' | 'instructorId' | 'name' | 'notes'>;
