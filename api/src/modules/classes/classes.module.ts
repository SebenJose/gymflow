import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClockModule } from '../../common/clock/clock.module.js';
import { UsersModule } from '../users/users.module.js';
import { BookingsController } from './bookings.controller.js';
import { BookingsRepository } from './bookings.repository.js';
import { BookingsService } from './bookings.service.js';
import { ClassesController } from './classes.controller.js';
import { ClassesRepository } from './classes.repository.js';
import { ClassesService } from './classes.service.js';
import { ClassBooking } from './entities/class-booking.entity.js';
import { GymClass } from './entities/gym-class.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([GymClass, ClassBooking]), UsersModule, ClockModule],
  controllers: [ClassesController, BookingsController],
  providers: [ClassesService, ClassesRepository, BookingsService, BookingsRepository],
})
export class ClassesModule {}
