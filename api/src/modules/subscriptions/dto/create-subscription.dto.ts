import { IsUUID } from 'class-validator';

export class CreateSubscriptionDto {
  @IsUUID('all', { message: 'Informe um plano válido' })
  planId: string;
}
