import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { UserRole } from '../../common/types/user-role.js';
import { type NewUser, User } from './entities/user.entity.js';

@Injectable()
export class UsersRepository {
  constructor(@InjectRepository(User) private readonly repository: Repository<User>) {}

  findAll(role?: UserRole): Promise<User[]> {
    return this.repository.find({
      where: role === undefined ? {} : { role },
      order: { name: 'ASC' },
    });
  }

  findById(id: string): Promise<User | null> {
    return this.repository.findOneBy({ id });
  }

  /** Única consulta que carrega o hash da senha (coluna com `select: false`). */
  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.repository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
  }

  create(data: NewUser): Promise<User> {
    return this.repository.save(this.repository.create(data));
  }
}
