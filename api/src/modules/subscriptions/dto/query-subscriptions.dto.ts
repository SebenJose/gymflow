import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { SubscriptionStatus } from '../subscription-status.js';

export class QuerySubscriptionsDto {
  @IsOptional()
  @IsEnum(SubscriptionStatus, {
    message: `A situação deve ser: ${Object.values(SubscriptionStatus).join(', ')}`,
  })
  status?: SubscriptionStatus;

  @IsOptional()
  @IsUUID('all', { message: 'Informe um aluno válido' })
  studentId?: string;
}
