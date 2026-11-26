import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { toBoolean } from '../../../common/transformers/to-boolean.transformer.js';

export class QueryPlansDto {
  /** Incluir planos desativados (só administradores). */
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean({ message: 'includeInactive deve ser true ou false' })
  includeInactive?: boolean;
}
