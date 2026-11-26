import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module.js';
import { WorkoutExercise } from './entities/workout-exercise.entity.js';
import { Workout } from './entities/workout.entity.js';
import { WorkoutsController } from './workouts.controller.js';
import { WorkoutsRepository } from './workouts.repository.js';
import { WorkoutsService } from './workouts.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Workout, WorkoutExercise]), UsersModule],
  controllers: [WorkoutsController],
  providers: [WorkoutsService, WorkoutsRepository],
  exports: [WorkoutsService],
})
export class WorkoutsModule {}
