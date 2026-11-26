import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CreateExerciseDto } from './create-exercise.dto.js';
import {
  WORKOUT_MAX_EXERCISES,
  WORKOUT_NAME_MAX_LENGTH,
  WORKOUT_NOTES_MAX_LENGTH,
} from './workout-constraints.js';

export class CreateWorkoutDto {
  @IsUUID('all', { message: 'Informe um aluno válido' })
  studentId: string;

  @IsString({ message: 'O nome da ficha deve ser um texto' })
  @IsNotEmpty({ message: 'O nome da ficha é obrigatório' })
  @MaxLength(WORKOUT_NAME_MAX_LENGTH, {
    message: `O nome da ficha deve ter no máximo ${WORKOUT_NAME_MAX_LENGTH} caracteres`,
  })
  name: string;

  @IsOptional()
  @IsString({ message: 'A observação deve ser um texto' })
  @MaxLength(WORKOUT_NOTES_MAX_LENGTH, {
    message: `A observação deve ter no máximo ${WORKOUT_NOTES_MAX_LENGTH} caracteres`,
  })
  notes?: string;

  @IsArray({ message: 'Os exercícios devem ser uma lista' })
  @ArrayMinSize(1, { message: 'A ficha deve ter pelo menos 1 exercício' })
  @ArrayMaxSize(WORKOUT_MAX_EXERCISES, {
    message: `A ficha pode ter no máximo ${WORKOUT_MAX_EXERCISES} exercícios`,
  })
  @ValidateNested({ each: true })
  @Type(() => CreateExerciseDto)
  exercises: CreateExerciseDto[];
}
