import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  EXERCISE_MAX_LOAD_KG,
  EXERCISE_MAX_REPS,
  EXERCISE_MAX_REST_SECONDS,
  EXERCISE_MAX_SETS,
  EXERCISE_NAME_MAX_LENGTH,
  EXERCISE_NOTES_MAX_LENGTH,
} from './workout-constraints.js';

export class CreateExerciseDto {
  @IsString({ message: 'O nome do exercício deve ser um texto' })
  @IsNotEmpty({ message: 'O nome do exercício é obrigatório' })
  @MaxLength(EXERCISE_NAME_MAX_LENGTH, {
    message: `O nome do exercício deve ter no máximo ${EXERCISE_NAME_MAX_LENGTH} caracteres`,
  })
  name: string;

  @IsInt({ message: 'As séries devem ser um número inteiro' })
  @Min(1, { message: 'O exercício deve ter pelo menos 1 série' })
  @Max(EXERCISE_MAX_SETS, { message: `O máximo é de ${EXERCISE_MAX_SETS} séries` })
  sets: number;

  @IsInt({ message: 'As repetições devem ser um número inteiro' })
  @Min(1, { message: 'O exercício deve ter pelo menos 1 repetição' })
  @Max(EXERCISE_MAX_REPS, { message: `O máximo é de ${EXERCISE_MAX_REPS} repetições` })
  reps: number;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 1 },
    { message: 'A carga deve ser um número com até 1 casa decimal' },
  )
  @Min(0, { message: 'A carga não pode ser negativa' })
  @Max(EXERCISE_MAX_LOAD_KG, { message: `A carga máxima é de ${EXERCISE_MAX_LOAD_KG} kg` })
  loadKg?: number;

  @IsOptional()
  @IsInt({ message: 'O descanso deve ser um número inteiro de segundos' })
  @Min(0, { message: 'O descanso não pode ser negativo' })
  @Max(EXERCISE_MAX_REST_SECONDS, {
    message: `O descanso máximo é de ${EXERCISE_MAX_REST_SECONDS} segundos`,
  })
  restSeconds?: number;

  @IsOptional()
  @IsString({ message: 'A observação deve ser um texto' })
  @MaxLength(EXERCISE_NOTES_MAX_LENGTH, {
    message: `A observação deve ter no máximo ${EXERCISE_NOTES_MAX_LENGTH} caracteres`,
  })
  notes?: string;
}
