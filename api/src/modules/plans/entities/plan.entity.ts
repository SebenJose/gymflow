import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 80, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string | null;

  /** Valor da mensalidade em centavos, para não ter erro de arredondamento. */
  @Column({ name: 'monthly_price_cents', type: 'integer' })
  monthlyPriceCents: number;

  @Column({ name: 'duration_months', type: 'integer' })
  durationMonths: number;

  /** Plano inativo não aparece para contratação, mas mantém as matrículas existentes. */
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
