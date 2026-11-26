import { IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../../../common/types/user-role.js';

export class QueryUsersDto {
  @IsOptional()
  @IsEnum(UserRole, { message: `O papel deve ser: ${Object.values(UserRole).join(', ')}` })
  role?: UserRole;
}
