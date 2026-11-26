import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { IdParam } from '../../common/decorators/id-param.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import type { AuthUser } from '../../common/types/auth-user.type.js';
import { UserRole } from '../../common/types/user-role.js';
import { CreateSubscriptionDto } from './dto/create-subscription.dto.js';
import { QuerySubscriptionsDto } from './dto/query-subscriptions.dto.js';
import { SubscriptionResponseDto } from './dto/subscription-response.dto.js';
import { UpdateSubscriptionStatusDto } from './dto/update-subscription-status.dto.js';
import type { Subscription } from './entities/subscription.entity.js';
import { SubscriptionsService } from './subscriptions.service.js';

const toResponse = (subscription: Subscription): SubscriptionResponseDto =>
  new SubscriptionResponseDto(subscription);

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @Roles([UserRole.Student])
  async subscribe(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateSubscriptionDto,
  ): Promise<SubscriptionResponseDto> {
    return toResponse(await this.subscriptionsService.subscribe(user, dto.planId));
  }

  // Declarada antes de `:id` para "me" não ser lido como identificador.
  @Get('me')
  @Roles([UserRole.Student])
  async findMine(@CurrentUser() user: AuthUser): Promise<SubscriptionResponseDto[]> {
    return (await this.subscriptionsService.findMine(user)).map(toResponse);
  }

  @Get()
  @Roles([UserRole.Admin])
  async findAll(@Query() query: QuerySubscriptionsDto): Promise<SubscriptionResponseDto[]> {
    const filter = {
      ...(query.status !== undefined && { status: query.status }),
      ...(query.studentId !== undefined && { studentId: query.studentId }),
    };
    return (await this.subscriptionsService.findAll(filter)).map(toResponse);
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: AuthUser,
    @IdParam() id: string,
  ): Promise<SubscriptionResponseDto> {
    return toResponse(await this.subscriptionsService.findOne(user, id));
  }

  @Patch(':id/status')
  @Roles([UserRole.Admin])
  async changeStatus(
    @IdParam() id: string,
    @Body() dto: UpdateSubscriptionStatusDto,
  ): Promise<SubscriptionResponseDto> {
    return toResponse(await this.subscriptionsService.changeStatus(id, dto.status));
  }
}
