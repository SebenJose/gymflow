import type { UserRole } from '../../../common/types/user-role.js';
import type { User } from '../entities/user.entity.js';

/** Saída HTTP do usuário: nunca inclui o hash da senha. */
export class UserResponseDto {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: UserRole;
  readonly createdAt: Date;

  constructor(user: User) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.role = user.role;
    this.createdAt = user.createdAt;
  }
}
