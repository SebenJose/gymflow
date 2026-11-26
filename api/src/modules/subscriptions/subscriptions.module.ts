import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClockModule } from '../../common/clock/clock.module.js';
import { PlansModule } from '../plans/plans.module.js';
import { Invoice } from './entities/invoice.entity.js';
import { Subscription } from './entities/subscription.entity.js';
import { InvoicesController } from './invoices.controller.js';
import { SubscriptionsController } from './subscriptions.controller.js';
import { SubscriptionsRepository } from './subscriptions.repository.js';
import { SubscriptionsService } from './subscriptions.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription, Invoice]), PlansModule, ClockModule],
  controllers: [SubscriptionsController, InvoicesController],
  providers: [SubscriptionsService, SubscriptionsRepository],
})
export class SubscriptionsModule {}
