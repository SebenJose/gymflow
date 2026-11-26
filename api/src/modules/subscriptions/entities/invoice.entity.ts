import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { InvoiceStatus } from '../subscription-status.js';
import { Subscription } from './subscription.entity.js';

/** Mensalidade de uma matrícula. */
@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'subscription_id', type: 'uuid' })
  subscriptionId: string;

  @ManyToOne(() => Subscription, (subscription) => subscription.invoices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subscription_id' })
  subscription: Relation<Subscription>;

  @Column({ name: 'due_date', type: 'date' })
  dueDate: string;

  @Column({ name: 'amount_cents', type: 'integer' })
  amountCents: number;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    enumName: 'invoice_status',
    default: InvoiceStatus.Pending,
  })
  status: InvoiceStatus;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

export type NewInvoice = Pick<Invoice, 'dueDate' | 'amountCents'>;
