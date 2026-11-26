import { IsOptional, IsUUID } from 'class-validator';

export class QueryWorkoutsDto {
  @IsOptional()
  @IsUUID('all', { message: 'Informe um aluno válido' })
  studentId?: string;
}
