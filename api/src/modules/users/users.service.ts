import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isUniqueViolation } from '../../common/database/postgres-errors.js';
import type { AuthUser } from '../../common/types/auth-user.type.js';
import { UserRole } from '../../common/types/user-role.js';
import type { NewUser, User } from './entities/user.entity.js';
import { UsersRepository } from './users.repository.js';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  /** A unicidade do e-mail é garantida pela constraint do banco, sem corrida entre consulta e inserção. */
  async create(data: NewUser): Promise<User> {
    try {
      return await this.usersRepository.create(data);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('E-mail já cadastrado');
      }
      throw error;
    }
  }

  /** Admin lista qualquer papel; instrutor só lista alunos (para montar as fichas). */
  findAll(requester: AuthUser, role?: UserRole): Promise<User[]> {
    if (requester.role === UserRole.Admin) {
      return this.usersRepository.findAll(role);
    }
    if (role !== undefined && role !== UserRole.Student) {
      throw new ForbiddenException('Instrutores só podem listar alunos');
    }
    return this.usersRepository.findAll(UserRole.Student);
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (user === null) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepository.findByEmailWithPassword(email);
  }
}
