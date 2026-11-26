import { IsEnum } from 'class-validator';
import { SubscriptionStatus } from '../subscription-status.js';

export class UpdateSubscriptionStatusDto {
  @IsEnum(SubscriptionStatus, {
    message: `A situação deve ser: ${Object.values(SubscriptionStatus).join(', ')}`,
  })
  status: SubscriptionStatus;
}
