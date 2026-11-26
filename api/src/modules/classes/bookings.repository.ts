import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import type { DatePeriod } from '../../common/validation/period.js';
import { ClassBooking } from './entities/class-booking.entity.js';
import { GymClass } from './entities/gym-class.entity.js';
import { whereStartsWithin } from './starts-within.js';

@Injectable()
export class BookingsRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  findById(id: string): Promise<ClassBooking | null> {
    return this.dataSource.getRepository(ClassBooking).findOne({
      where: { id },
      relations: { gymClass: { instructor: true } },
    });
  }

  /**
   * Ocupa uma vaga e cria a inscrição na mesma transação. O UPDATE só incrementa se ainda houver
   * vaga, e o Postgres serializa os UPDATEs da mesma linha: duas inscrições simultâneas nunca
   * ocupam a última vaga juntas. Inscrição repetida viola o índice único e desfaz o incremento.
   * Retorna o id da inscrição, ou `null` se a aula estiver lotada.
   */
  book(classId: string, studentId: string): Promise<string | null> {
    return this.dataSource.transaction(async (manager) => {
      const result = await manager
        .createQueryBuilder()
        .update(GymClass)
        .set({ bookedCount: () => 'booked_count + 1' })
        .where('id = :classId AND booked_count < capacity', { classId })
        .execute();
      if ((result.affected ?? 0) === 0) {
        return null;
      }
      const booking = await manager.save(manager.create(ClassBooking, { classId, studentId }));
      return booking.id;
    });
  }

  /** Remove a inscrição e libera a vaga na mesma transação. Retorna se havia inscrição. */
  cancel(classId: string, studentId: string): Promise<boolean> {
    return this.dataSource.transaction(async (manager) => {
      const result = await manager.delete(ClassBooking, { classId, studentId });
      if ((result.affected ?? 0) === 0) {
        return false;
      }
      await manager.decrement(GymClass, { id: classId }, 'bookedCount', 1);
      return true;
    });
  }

  findByStudent(studentId: string, period: DatePeriod): Promise<ClassBooking[]> {
    const query = this.dataSource
      .getRepository(ClassBooking)
      .createQueryBuilder('booking')
      .innerJoinAndSelect('booking.gymClass', 'gymClass')
      .leftJoinAndSelect('gymClass.instructor', 'instructor')
      .where('booking.studentId = :studentId', { studentId })
      .orderBy('gymClass.startsAt', 'ASC');
    return whereStartsWithin(query, 'gymClass', period).getMany();
  }

  findByClass(classId: string): Promise<ClassBooking[]> {
    return this.dataSource.getRepository(ClassBooking).find({
      where: { classId },
      relations: { student: true },
      order: { createdAt: 'ASC' },
    });
  }
}
