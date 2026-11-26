import { IsOptional, IsUUID, Matches } from 'class-validator';
import { ISO_DATE_PATTERN } from '../../../common/validation/iso-date.js';

export class QueryAttendanceDto {
  @IsOptional()
  @Matches(ISO_DATE_PATTERN, { message: 'A data inicial deve estar no formato AAAA-MM-DD' })
  from?: string;

  @IsOptional()
  @Matches(ISO_DATE_PATTERN, { message: 'A data final deve estar no formato AAAA-MM-DD' })
  to?: string;
}

/** A equipe consulta a frequência de um aluno específico. */
export class QueryStudentAttendanceDto extends QueryAttendanceDto {
  @IsUUID('all', { message: 'Informe um aluno válido' })
  studentId: string;
}
