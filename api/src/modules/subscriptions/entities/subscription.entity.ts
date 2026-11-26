import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Plan } from '../../plans/entities/plan.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { SubscriptionStatus } from '../subscription-status.js';
import { Invoice } from './invoice.entity.js';

/**
 * Matrícula de um aluno em um plano.
 * O índice parcial garante, no banco, no máximo uma matrícula ativa ou suspensa por aluno,
 * mesmo com duas contratações simultâneas.
 */
@Entity('subscriptions')
@Index('uq_subscriptions_open_per_student', ['studentId'], {
  unique: true,
  where: `"status" IN ('active', 'suspended')`,
})
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Relation<User>;

  @Column({ name: 'plan_id', type: 'uuid' })
  planId: string;

  /** RESTRICT: plano com matrícula não pode ser apagado, só desativado. */
  @ManyToOne(() => Plan, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'plan_id' })
  plan: Relation<Plan>;

  @Column({ type: 'enum', enum: SubscriptionStatus, enumName: 'subscription_status' })
  status: SubscriptionStatus;

  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate: string;

  /** Valor contratado; mudar o preço do plano depois não altera matrículas existentes. */
  @Column({ name: 'monthly_price_cents', type: 'integer' })
  monthlyPriceCents: number;

  @OneToMany(() => Invoice, (invoice) => invoice.subscription)
  invoices: Relation<Invoice[]>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

export type NewSubscription = Pick<
  Subscription,
  'studentId' | 'planId' | 'status' | 'startDate' | 'endDate' | 'monthlyPriceCents'
>;
