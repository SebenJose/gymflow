import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  PLAN_DESCRIPTION_MAX_LENGTH,
  PLAN_MAX_DURATION_MONTHS,
  PLAN_NAME_MAX_LENGTH,
} from './plan-constraints.js';

/** Mesmas regras do cadastro, com todos os campos opcionais. */
export class UpdatePlanDto {
  @IsOptional()
  @IsString({ message: 'O nome deve ser um texto' })
  @IsNotEmpty({ message: 'O nome não pode ficar vazio' })
  @MaxLength(PLAN_NAME_MAX_LENGTH, {
    message: `O nome deve ter no máximo ${PLAN_NAME_MAX_LENGTH} caracteres`,
  })
  name?: string;

  @IsOptional()
  @IsString({ message: 'A descrição deve ser um texto' })
  @MaxLength(PLAN_DESCRIPTION_MAX_LENGTH, {
    message: `A descrição deve ter no máximo ${PLAN_DESCRIPTION_MAX_LENGTH} caracteres`,
  })
  description?: string;

  @IsOptional()
  @IsInt({ message: 'A mensalidade deve ser um valor inteiro em centavos' })
  @Min(0, { message: 'A mensalidade não pode ser negativa' })
  monthlyPriceCents?: number;

  @IsOptional()
  @IsInt({ message: 'A duração deve ser um número inteiro de meses' })
  @Min(1, { message: 'A duração mínima é de 1 mês' })
  @Max(PLAN_MAX_DURATION_MONTHS, {
    message: `A duração máxima é de ${PLAN_MAX_DURATION_MONTHS} meses`,
  })
  durationMonths?: number;

  @IsOptional()
  @IsBoolean({ message: 'isActive deve ser verdadeiro ou falso' })
  isActive?: boolean;
}
