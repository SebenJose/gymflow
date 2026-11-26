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
import { BookingsService } from './bookings.service.js';
import { BookingResponseDto } from './dto/booking-response.dto.js';
import { QueryClassesDto } from './dto/query-classes.dto.js';
import { RosterEntryResponseDto } from './dto/roster-entry-response.dto.js';
import { UpdateAttendanceDto } from './dto/update-attendance.dto.js';

const CLASS_BOOKINGS = 'classes/:id/bookings';

@Controller()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post(CLASS_BOOKINGS)
  @Roles([UserRole.Student])
  async book(
    @CurrentUser() user: AuthUser,
    @IdParam() classId: string,
  ): Promise<BookingResponseDto> {
    return new BookingResponseDto(await this.bookingsService.book(user, classId));
  }

  @Delete(`${CLASS_BOOKINGS}/me`)
  @Roles([UserRole.Student])
  @HttpCode(HttpStatus.NO_CONTENT)
  cancel(@CurrentUser() user: AuthUser, @IdParam() classId: string): Promise<void> {
    return this.bookingsService.cancel(user, classId);
  }

  /** Lista de inscritos, para a equipe conduzir a aula. */
  @Get(CLASS_BOOKINGS)
  @Roles([UserRole.Instructor, UserRole.Admin])
  async findRoster(@IdParam() classId: string): Promise<RosterEntryResponseDto[]> {
    const bookings = await this.bookingsService.findRoster(classId);
    return bookings.map((booking) => new RosterEntryResponseDto(booking));
  }

  @Patch(`${CLASS_BOOKINGS}/:bookingId`)
  @Roles([UserRole.Instructor, UserRole.Admin])
  async markAttendance(
    @IdParam() classId: string,
    @IdParam('bookingId') bookingId: string,
    @Body() dto: UpdateAttendanceDto,
  ): Promise<RosterEntryResponseDto> {
    return new RosterEntryResponseDto(
      await this.bookingsService.markAttendance(classId, bookingId, dto.attended),
    );
  }

  @Get('bookings/me')
  @Roles([UserRole.Student])
  async findMine(
    @CurrentUser() user: AuthUser,
    @Query() query: QueryClassesDto,
  ): Promise<BookingResponseDto[]> {
    const bookings = await this.bookingsService.findMine(user, query);
    return bookings.map((booking) => new BookingResponseDto(booking));
  }
}
