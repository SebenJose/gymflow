import { BookingResponseDto } from '../../classes/dto/booking-response.dto.js';
import type { AttendanceSummary } from '../attendance-summary.js';
import type { AttendanceHistory } from '../attendance.service.js';

export class AttendanceHistoryResponseDto {
  readonly summary: AttendanceSummary;
  readonly classes: BookingResponseDto[];

  constructor(history: AttendanceHistory) {
    this.summary = history.summary;
    this.classes = history.bookings.map((booking) => new BookingResponseDto(booking));
  }
}
