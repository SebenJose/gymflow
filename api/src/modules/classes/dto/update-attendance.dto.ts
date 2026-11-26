import { IsBoolean } from 'class-validator';

export class UpdateAttendanceDto {
  /** `true` para presença, `false` para falta. */
  @IsBoolean({ message: 'attended deve ser verdadeiro ou falso' })
  attended: boolean;
}
