import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';

/**
 * Aula coletiva com horário e número de vagas.
 * `bookedCount` é mantido junto com as inscrições, na mesma transação; o CHECK garante no banco
 * que nunca passa da capacidade, mesmo com inscrições simultâneas.
 */
@Entity('classes')
@Check('chk_classes_booked_count', '"booked_count" >= 0 AND "booked_count" <= "capacity"')
export class GymClass {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 80 })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string | null;

  /** Fica nulo se o instrutor for removido, sem apagar a aula. */
  @Column({ name: 'instructor_id', type: 'uuid', nullable: true })
  instructorId: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'instructor_id' })
  instructor: Relation<User> | null;

  @Column({ name: 'starts_at', type: 'timestamptz' })
  startsAt: Date;

  @Column({ name: 'duration_minutes', type: 'integer' })
  durationMinutes: number;

  @Column({ type: 'integer' })
  capacity: number;

  @Column({ name: 'booked_count', type: 'integer', default: 0 })
  bookedCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

export type ClassData = Pick<
  GymClass,
  'name' | 'description' | 'instructorId' | 'startsAt' | 'durationMinutes' | 'capacity'
>;
