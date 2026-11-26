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
import { CreateExerciseDto } from './dto/create-exercise.dto.js';
import { CreateWorkoutDto } from './dto/create-workout.dto.js';
import { ExerciseResponseDto } from './dto/exercise-response.dto.js';
import { QueryWorkoutsDto } from './dto/query-workouts.dto.js';
import { UpdateExerciseDto } from './dto/update-exercise.dto.js';
import { UpdateWorkoutDto } from './dto/update-workout.dto.js';
import { WorkoutResponseDto } from './dto/workout-response.dto.js';
import type { Workout } from './entities/workout.entity.js';
import { WorkoutsService } from './workouts.service.js';

const STAFF = [UserRole.Instructor, UserRole.Admin];
const toResponse = (workout: Workout): WorkoutResponseDto => new WorkoutResponseDto(workout);

@Controller('workouts')
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @Post()
  @Roles(STAFF)
  async create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateWorkoutDto,
  ): Promise<WorkoutResponseDto> {
    return toResponse(await this.workoutsService.create(user, dto));
  }

  // Declarada antes de `:id` para "me" não ser lido como identificador.
  @Get('me')
  @Roles([UserRole.Student])
  async findMine(@CurrentUser() user: AuthUser): Promise<WorkoutResponseDto[]> {
    return (await this.workoutsService.findMine(user)).map(toResponse);
  }

  @Get()
  @Roles(STAFF)
  async findAll(@Query() query: QueryWorkoutsDto): Promise<WorkoutResponseDto[]> {
    const filter = query.studentId === undefined ? {} : { studentId: query.studentId };
    return (await this.workoutsService.findAll(filter)).map(toResponse);
  }

  @Get(':id')
  async findOne(@CurrentUser() user: AuthUser, @IdParam() id: string): Promise<WorkoutResponseDto> {
    return toResponse(await this.workoutsService.findOne(user, id));
  }

  @Patch(':id')
  @Roles(STAFF)
  async update(@IdParam() id: string, @Body() dto: UpdateWorkoutDto): Promise<WorkoutResponseDto> {
    return toResponse(await this.workoutsService.update(id, dto));
  }

  @Delete(':id')
  @Roles(STAFF)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@IdParam() id: string): Promise<void> {
    return this.workoutsService.remove(id);
  }

  @Post(':id/exercises')
  @Roles(STAFF)
  async addExercise(
    @IdParam() id: string,
    @Body() dto: CreateExerciseDto,
  ): Promise<ExerciseResponseDto> {
    return new ExerciseResponseDto(await this.workoutsService.addExercise(id, dto));
  }

  @Patch(':id/exercises/:exerciseId')
  @Roles(STAFF)
  async updateExercise(
    @IdParam() id: string,
    @IdParam('exerciseId') exerciseId: string,
    @Body() dto: UpdateExerciseDto,
  ): Promise<ExerciseResponseDto> {
    return new ExerciseResponseDto(await this.workoutsService.updateExercise(id, exerciseId, dto));
  }

  @Delete(':id/exercises/:exerciseId')
  @Roles(STAFF)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeExercise(@IdParam() id: string, @IdParam('exerciseId') exerciseId: string): Promise<void> {
    return this.workoutsService.removeExercise(id, exerciseId);
  }
}
