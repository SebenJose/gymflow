import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { GymClass } from './gym-class.entity.js';

/** Inscrição de um aluno em uma aula. O índice único impede inscrever duas vezes. */
@Entity('class_bookings')
@Index('uq_class_bookings_class_student', ['classId', 'studentId'], { unique: true })
export class ClassBooking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'class_id', type: 'uuid' })
  classId: string;

  @ManyToOne(() => GymClass, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'class_id' })
  gymClass: Relation<GymClass>;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Relation<User>;

  /** Presença registrada pela equipe depois do início da aula; nulo enquanto não registrada. */
  @Column({ type: 'boolean', nullable: true })
  attended: boolean | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
