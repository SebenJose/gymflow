import { IsOptional, Matches } from 'class-validator';
import { ISO_DATE_PATTERN } from '../../../common/validation/iso-date.js';

/** Período em dias no fuso da academia. Sem `from`, lista a partir de hoje. */
export class QueryClassesDto {
  @IsOptional()
  @Matches(ISO_DATE_PATTERN, { message: 'A data inicial deve estar no formato AAAA-MM-DD' })
  from?: string;

  @IsOptional()
  @Matches(ISO_DATE_PATTERN, { message: 'A data final deve estar no formato AAAA-MM-DD' })
  to?: string;
}
