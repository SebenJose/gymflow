import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Clock } from '../../common/clock/clock.js';
import { isCheckViolation } from '../../common/database/postgres-errors.js';
import type { AuthUser } from '../../common/types/auth-user.type.js';
import { UserRole } from '../../common/types/user-role.js';
import { assertValidPeriod, type DatePeriod } from '../../common/validation/period.js';
import { UsersService } from '../users/users.service.js';
import { ClassesRepository } from './classes.repository.js';
import type { CreateClassDto } from './dto/create-class.dto.js';
import type { UpdateClassDto } from './dto/update-class.dto.js';
import type { ClassData, GymClass } from './entities/gym-class.entity.js';

const CLASS_NOT_FOUND = 'Aula não encontrada';
const NOT_AN_INSTRUCTOR = 'O responsável pela aula deve ser um instrutor';
const STARTS_IN_THE_PAST = 'A aula deve começar no futuro';
const CAPACITY_BELOW_BOOKINGS = 'O número de vagas não pode ser menor que o de inscritos';

@Injectable()
export class ClassesService {
  constructor(
    private readonly classesRepository: ClassesRepository,
    private readonly usersService: UsersService,
    private readonly clock: Clock,
  ) {}

  /** Sem data inicial, lista só as aulas a partir de hoje. */
  findAll(period: DatePeriod): Promise<GymClass[]> {
    assertValidPeriod(period);
    return this.classesRepository.findAll({ ...period, from: period.from ?? this.clock.today() });
  }

  async findOne(id: string): Promise<GymClass> {
    const gymClass = await this.classesRepository.findById(id);
    if (gymClass === null) {
      throw new NotFoundException(CLASS_NOT_FOUND);
    }
    return gymClass;
  }

  async create(author: AuthUser, dto: CreateClassDto): Promise<GymClass> {
    const instructorId =
      dto.instructorId ?? (author.role === UserRole.Instructor ? author.id : undefined);
    const id = await this.classesRepository.create({
      name: dto.name,
      description: dto.description ?? null,
      instructorId: instructorId === undefined ? null : await this.instructorIdOf(instructorId),
      startsAt: this.futureDate(dto.startsAt),
      durationMinutes: dto.durationMinutes,
      capacity: dto.capacity,
    });
    return this.findOne(id);
  }

  async update(id: string, dto: UpdateClassDto): Promise<GymClass> {
    const { instructorId, startsAt, ...rest } = dto;
    const data: Partial<ClassData> = {
      ...rest,
      ...(instructorId !== undefined && { instructorId: await this.instructorIdOf(instructorId) }),
      ...(startsAt !== undefined && { startsAt: this.futureDate(startsAt) }),
    };

    let updated: boolean;
    try {
      updated = await this.classesRepository.update(id, data);
    } catch (error) {
      throw isCheckViolation(error) ? new ConflictException(CAPACITY_BELOW_BOOKINGS) : error;
    }
    if (!updated) {
      throw new NotFoundException(CLASS_NOT_FOUND);
    }
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    if (!(await this.classesRepository.delete(id))) {
      throw new NotFoundException(CLASS_NOT_FOUND);
    }
  }

  /** Usuário inexistente responde 404; usuário que não é instrutor, 400. */
  private async instructorIdOf(userId: string): Promise<string> {
    const user = await this.usersService.findById(userId);
    if (user.role !== UserRole.Instructor) {
      throw new BadRequestException(NOT_AN_INSTRUCTOR);
    }
    return user.id;
  }

  private futureDate(isoDateTime: string): Date {
    const date = new Date(isoDateTime);
    if (date <= this.clock.now()) {
      throw new BadRequestException(STARTS_IN_THE_PAST);
    }
    return date;
  }
}
