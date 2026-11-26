import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { WORKOUT_NAME_MAX_LENGTH, WORKOUT_NOTES_MAX_LENGTH } from './workout-constraints.js';

/** Altera os dados da ficha; os exercícios têm rotas próprias. */
export class UpdateWorkoutDto {
  @IsOptional()
  @IsString({ message: 'O nome da ficha deve ser um texto' })
  @IsNotEmpty({ message: 'O nome da ficha não pode ficar vazio' })
  @MaxLength(WORKOUT_NAME_MAX_LENGTH, {
    message: `O nome da ficha deve ter no máximo ${WORKOUT_NAME_MAX_LENGTH} caracteres`,
  })
  name?: string;

  @IsOptional()
  @IsString({ message: 'A observação deve ser um texto' })
  @MaxLength(WORKOUT_NOTES_MAX_LENGTH, {
    message: `A observação deve ter no máximo ${WORKOUT_NOTES_MAX_LENGTH} caracteres`,
  })
  notes?: string;
}
