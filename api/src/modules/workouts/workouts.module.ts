import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClockModule } from '../../common/clock/clock.module.js';
import { UsersModule } from '../users/users.module.js';
import { CompletionsController } from './completions.controller.js';
import { CompletionsRepository } from './completions.repository.js';
import { CompletionsService } from './completions.service.js';
import { ExerciseCompletion } from './entities/exercise-completion.entity.js';
import { WorkoutExercise } from './entities/workout-exercise.entity.js';
import { Workout } from './entities/workout.entity.js';
import { WorkoutsController } from './workouts.controller.js';
import { WorkoutsRepository } from './workouts.repository.js';
import { WorkoutsService } from './workouts.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workout, WorkoutExercise, ExerciseCompletion]),
    UsersModule,
    ClockModule,
  ],
  controllers: [WorkoutsController, CompletionsController],
  providers: [WorkoutsService, WorkoutsRepository, CompletionsService, CompletionsRepository],
  exports: [WorkoutsService],
})
export class WorkoutsModule {}
