import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { IdParam } from '../../common/decorators/id-param.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import type { AuthUser } from '../../common/types/auth-user.type.js';
import { UserRole } from '../../common/types/user-role.js';
import { CreatePlanDto } from './dto/create-plan.dto.js';
import { PlanResponseDto } from './dto/plan-response.dto.js';
import { QueryPlansDto } from './dto/query-plans.dto.js';
import { UpdatePlanDto } from './dto/update-plan.dto.js';
import { PlansService } from './plans.service.js';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query() query: QueryPlansDto,
  ): Promise<PlanResponseDto[]> {
    const plans = await this.plansService.findAll(user, query.includeInactive ?? false);
    return plans.map((plan) => new PlanResponseDto(plan));
  }

  @Get(':id')
  async findOne(@CurrentUser() user: AuthUser, @IdParam() id: string): Promise<PlanResponseDto> {
    return new PlanResponseDto(await this.plansService.findOne(user, id));
  }

  @Post()
  @Roles([UserRole.Admin])
  async create(@Body() dto: CreatePlanDto): Promise<PlanResponseDto> {
    return new PlanResponseDto(await this.plansService.create(dto));
  }

  @Patch(':id')
  @Roles([UserRole.Admin])
  async update(@IdParam() id: string, @Body() dto: UpdatePlanDto): Promise<PlanResponseDto> {
    return new PlanResponseDto(await this.plansService.update(id, dto));
  }

  @Delete(':id')
  @Roles([UserRole.Admin])
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@IdParam() id: string): Promise<void> {
    return this.plansService.remove(id);
  }
}
