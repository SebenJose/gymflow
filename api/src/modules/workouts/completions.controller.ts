import { Controller, Delete, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { IdParam } from '../../common/decorators/id-param.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import type { AuthUser } from '../../common/types/auth-user.type.js';
import { UserRole } from '../../common/types/user-role.js';
import { CompletionsService } from './completions.service.js';
import { CompletionResponseDto } from './dto/completion-response.dto.js';
import { QueryCompletionsDto } from './dto/query-completions.dto.js';
import type { CompletionFilter } from './completions.repository.js';

const EXERCISE_COMPLETIONS = 'workouts/:id/exercises/:exerciseId/completions';

function toFilter(query: QueryCompletionsDto, studentId?: string): CompletionFilter {
  return {
    ...(query.from !== undefined && { from: query.from }),
    ...(query.to !== undefined && { to: query.to }),
    ...(studentId !== undefined && { studentId }),
  };
}

@Controller()
export class CompletionsController {
  constructor(private readonly completionsService: CompletionsService) {}

  @Post(EXERCISE_COMPLETIONS)
  @Roles([UserRole.Student])
  async complete(
    @CurrentUser() user: AuthUser,
    @IdParam() workoutId: string,
    @IdParam('exerciseId') exerciseId: string,
  ): Promise<CompletionResponseDto> {
    return new CompletionResponseDto(
      await this.completionsService.complete(user, workoutId, exerciseId),
    );
  }

  @Delete(`${EXERCISE_COMPLETIONS}/today`)
  @Roles([UserRole.Student])
  @HttpCode(HttpStatus.NO_CONTENT)
  undoToday(
    @CurrentUser() user: AuthUser,
    @IdParam() workoutId: string,
    @IdParam('exerciseId') exerciseId: string,
  ): Promise<void> {
    return this.completionsService.undoToday(user, workoutId, exerciseId);
  }

  /** Histórico do próprio aluno; `studentId` na query é ignorado. */
  @Get('completions/me')
  @Roles([UserRole.Student])
  async findMine(
    @CurrentUser() user: AuthUser,
    @Query() query: QueryCompletionsDto,
  ): Promise<CompletionResponseDto[]> {
    const completions = await this.completionsService.findHistory(toFilter(query, user.id));
    return completions.map((completion) => new CompletionResponseDto(completion));
  }

  @Get('completions')
  @Roles([UserRole.Instructor, UserRole.Admin])
  async findAll(@Query() query: QueryCompletionsDto): Promise<CompletionResponseDto[]> {
    const completions = await this.completionsService.findHistory(toFilter(query, query.studentId));
    return completions.map((completion) => new CompletionResponseDto(completion));
  }
}
