import { Controller, Get, Query } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import type { AuthUser } from '../../common/types/auth-user.type.js';
import { UserRole } from '../../common/types/user-role.js';
import { AttendanceService } from './attendance.service.js';
import { AttendanceHistoryResponseDto } from './dto/attendance-history-response.dto.js';
import { QueryAttendanceDto, QueryStudentAttendanceDto } from './dto/query-attendance.dto.js';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('me')
  @Roles([UserRole.Student])
  async findMine(
    @CurrentUser() user: AuthUser,
    @Query() query: QueryAttendanceDto,
  ): Promise<AttendanceHistoryResponseDto> {
    return new AttendanceHistoryResponseDto(await this.attendanceService.findMine(user, query));
  }

  @Get()
  @Roles([UserRole.Instructor, UserRole.Admin])
  async findOfStudent(
    @Query() query: QueryStudentAttendanceDto,
  ): Promise<AttendanceHistoryResponseDto> {
    const { studentId, ...period } = query;
    return new AttendanceHistoryResponseDto(
      await this.attendanceService.findOfStudent(studentId, period),
    );
  }
}
