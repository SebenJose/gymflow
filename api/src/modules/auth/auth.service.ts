import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtPayload } from '../../common/types/auth-user.type.js';
import { UserRole } from '../../common/types/user-role.js';
import { UserResponseDto } from '../users/dto/user-response.dto.js';
import type { User } from '../users/entities/user.entity.js';
import { UsersService } from '../users/users.service.js';
import { AuthResponseDto } from './dto/auth-response.dto.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RegisterDto } from './dto/register.dto.js';
import { PasswordHasher } from './password-hasher.js';

const INVALID_CREDENTIALS_MESSAGE = 'E-mail ou senha inválidos';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordHasher: PasswordHasher,
    private readonly jwtService: JwtService,
  ) {}

  /** O cadastro público cria sempre um aluno; instrutores e admins vêm do seed ou do admin. */
  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const user = await this.usersService.create({
      name: dto.name.trim(),
      email: normalizeEmail(dto.email),
      passwordHash: await this.passwordHasher.hash(dto.password),
      role: UserRole.Student,
    });
    return this.buildResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmailWithPassword(normalizeEmail(dto.email));
    const isValid =
      user !== null && (await this.passwordHasher.compare(dto.password, user.passwordHash));
    if (user === null || !isValid) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }
    return this.buildResponse(user);
  }

  private async buildResponse(user: User): Promise<AuthResponseDto> {
    const payload: JwtPayload = { sub: user.id, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);
    return new AuthResponseDto(accessToken, new UserResponseDto(user));
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
