import {
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ISO_DATE_TIME_WITH_OFFSET_PATTERN } from '../../../common/validation/iso-date.js';
import {
  CLASS_DESCRIPTION_MAX_LENGTH,
  CLASS_MAX_CAPACITY,
  CLASS_MAX_DURATION_MINUTES,
  CLASS_MIN_DURATION_MINUTES,
  CLASS_NAME_MAX_LENGTH,
  CLASS_STARTS_AT_FORMAT_MESSAGE,
} from './class-constraints.js';

/** Mesmas regras do cadastro, com todos os campos opcionais. */
export class UpdateClassDto {
  @IsOptional()
  @IsString({ message: 'O nome da aula deve ser um texto' })
  @IsNotEmpty({ message: 'O nome da aula não pode ficar vazio' })
  @MaxLength(CLASS_NAME_MAX_LENGTH, {
    message: `O nome da aula deve ter no máximo ${CLASS_NAME_MAX_LENGTH} caracteres`,
  })
  name?: string;

  @IsOptional()
  @IsString({ message: 'A descrição deve ser um texto' })
  @MaxLength(CLASS_DESCRIPTION_MAX_LENGTH, {
    message: `A descrição deve ter no máximo ${CLASS_DESCRIPTION_MAX_LENGTH} caracteres`,
  })
  description?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Informe um instrutor válido' })
  instructorId?: string;

  @IsOptional()
  @Matches(ISO_DATE_TIME_WITH_OFFSET_PATTERN, { message: CLASS_STARTS_AT_FORMAT_MESSAGE })
  @IsISO8601({ strict: true }, { message: CLASS_STARTS_AT_FORMAT_MESSAGE })
  startsAt?: string;

  @IsOptional()
  @IsInt({ message: 'A duração deve ser um número inteiro de minutos' })
  @Min(CLASS_MIN_DURATION_MINUTES, {
    message: `A duração mínima é de ${CLASS_MIN_DURATION_MINUTES} minutos`,
  })
  @Max(CLASS_MAX_DURATION_MINUTES, {
    message: `A duração máxima é de ${CLASS_MAX_DURATION_MINUTES} minutos`,
  })
  durationMinutes?: number;

  @IsOptional()
  @IsInt({ message: 'O número de vagas deve ser um inteiro' })
  @Min(1, { message: 'A aula deve ter pelo menos 1 vaga' })
  @Max(CLASS_MAX_CAPACITY, { message: `A aula pode ter no máximo ${CLASS_MAX_CAPACITY} vagas` })
  capacity?: number;
}
