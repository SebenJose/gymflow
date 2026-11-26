import type { DataSource, EntityManager } from 'typeorm';
import type { Clock } from '../../common/clock/clock.js';
import type { PasswordHasher } from '../../modules/auth/password-hasher.js';
import { ClassBooking } from '../../modules/classes/entities/class-booking.entity.js';
import { GymClass } from '../../modules/classes/entities/gym-class.entity.js';
import { Plan } from '../../modules/plans/entities/plan.entity.js';
import { buildBillingSchedule } from '../../modules/subscriptions/billing-schedule.js';
import { Invoice } from '../../modules/subscriptions/entities/invoice.entity.js';
import { Subscription } from '../../modules/subscriptions/entities/subscription.entity.js';
import { InvoiceStatus } from '../../modules/subscriptions/subscription-status.js';
import { User } from '../../modules/users/entities/user.entity.js';
import { ExerciseCompletion } from '../../modules/workouts/entities/exercise-completion.entity.js';
import { WorkoutExercise } from '../../modules/workouts/entities/workout-exercise.entity.js';
import { Workout } from '../../modules/workouts/entities/workout.entity.js';
import { SEED_CLASSES, SEED_WORKOUTS } from './seed-activities.js';
import {
  SEED_PASSWORD,
  SEED_PLANS,
  SEED_SUBSCRIPTIONS,
  SEED_USERS,
  type SeedPlanKey,
  type SeedUserKey,
} from './seed-data.js';
import { addDays, atBusinessTime } from './seed-dates.js';

export type SeedResult = 'seeded' | 'skipped';

const PAYMENT_TIME = '10:00';
const WORKOUT_TIME = '19:00';

/**
 * Popula o banco com dados de exemplo, relativos à data de hoje.
 * Só roda com o banco vazio (sem usuários), para nunca misturar com dados reais;
 * tudo acontece em uma transação.
 */
export class DatabaseSeeder {
  constructor(
    private readonly dataSource: DataSource,
    private readonly passwordHasher: PasswordHasher,
    private readonly clock: Clock,
  ) {}

  async run(): Promise<SeedResult> {
    if ((await this.dataSource.getRepository(User).count()) > 0) {
      return 'skipped';
    }
    await this.dataSource.transaction(async (manager) => {
      const users = await this.seedUsers(manager);
      const plans = await this.seedPlans(manager);
      await this.seedSubscriptions(manager, users, plans);
      await this.seedWorkouts(manager, users);
      await this.seedClasses(manager, users);
    });
    return 'seeded';
  }

  private async seedUsers(manager: EntityManager): Promise<Map<SeedUserKey, User>> {
    const passwordHash = await this.passwordHasher.hash(SEED_PASSWORD);
    const users = new Map<SeedUserKey, User>();
    for (const { key, name, email, role } of SEED_USERS) {
      users.set(key, await manager.save(manager.create(User, { name, email, role, passwordHash })));
    }
    return users;
  }

  private async seedPlans(manager: EntityManager): Promise<Map<SeedPlanKey, Plan>> {
    const plans = new Map<SeedPlanKey, Plan>();
    for (const { key, ...data } of SEED_PLANS) {
      plans.set(key, await manager.save(manager.create(Plan, data)));
    }
    return plans;
  }

  private async seedSubscriptions(
    manager: EntityManager,
    users: Map<SeedUserKey, User>,
    plans: Map<SeedPlanKey, Plan>,
  ): Promise<void> {
    for (const seed of SEED_SUBSCRIPTIONS) {
      const plan = pick(plans, seed.plan);
      const schedule = buildBillingSchedule(
        addDays(this.clock.today(), -seed.startedDaysAgo),
        plan.durationMonths,
      );
      const subscription = await manager.save(
        manager.create(Subscription, {
          studentId: pick(users, seed.student).id,
          planId: plan.id,
          status: seed.status,
          startDate: schedule.startDate,
          endDate: schedule.endDate,
          monthlyPriceCents: plan.monthlyPriceCents,
        }),
      );
      await manager.save(
        schedule.dueDates.map((dueDate, index) => {
          const paid = index < seed.paidInvoices;
          return manager.create(Invoice, {
            subscriptionId: subscription.id,
            dueDate,
            amountCents: plan.monthlyPriceCents,
            status: paid ? InvoiceStatus.Paid : InvoiceStatus.Pending,
            paidAt: paid ? atBusinessTime(dueDate, PAYMENT_TIME) : null,
          });
        }),
      );
    }
  }

  private async seedWorkouts(manager: EntityManager, users: Map<SeedUserKey, User>): Promise<void> {
    for (const seed of SEED_WORKOUTS) {
      const workout = await manager.save(
        manager.create(Workout, {
          studentId: pick(users, seed.student).id,
          instructorId: pick(users, seed.instructor).id,
          name: seed.name,
          notes: seed.notes ?? null,
        }),
      );
      const exercises = await manager.save(
        seed.exercises.map((exercise, position) =>
          manager.create(WorkoutExercise, {
            workoutId: workout.id,
            position,
            name: exercise.name,
            sets: exercise.sets,
            reps: exercise.reps,
            loadKg: exercise.loadKg ?? null,
            restSeconds: exercise.restSeconds ?? null,
            notes: null,
          }),
        ),
      );
      const completions = seed.completedDaysAgo.flatMap(({ daysAgo, positions }) => {
        const day = addDays(this.clock.today(), -daysAgo);
        return positions.map((position) => {
          const exercise = exercises[position];
          if (exercise === undefined) {
            throw new Error(`Seed: exercício ${position} não existe em "${seed.name}"`);
          }
          return manager.create(ExerciseCompletion, {
            studentId: workout.studentId,
            workoutId: workout.id,
            exerciseId: exercise.id,
            workoutName: workout.name,
            exerciseName: exercise.name,
            sets: exercise.sets,
            reps: exercise.reps,
            loadKg: exercise.loadKg,
            completedOn: day,
            completedAt: atBusinessTime(day, WORKOUT_TIME),
          });
        });
      });
      await manager.save(completions);
    }
  }

  private async seedClasses(manager: EntityManager, users: Map<SeedUserKey, User>): Promise<void> {
    for (const seed of SEED_CLASSES) {
      const gymClass = await manager.save(
        manager.create(GymClass, {
          name: seed.name,
          description: seed.description,
          instructorId: pick(users, seed.instructor).id,
          startsAt: atBusinessTime(addDays(this.clock.today(), seed.inDays), seed.time),
          durationMinutes: seed.durationMinutes,
          capacity: seed.capacity,
          bookedCount: seed.bookings.length,
        }),
      );
      await manager.save(
        seed.bookings.map(({ student, attended }) =>
          manager.create(ClassBooking, {
            classId: gymClass.id,
            studentId: pick(users, student).id,
            attended,
          }),
        ),
      );
    }
  }
}

/** Os mapas são preenchidos a partir das mesmas constantes que os referenciam. */
function pick<K, V>(map: Map<K, V>, key: K): V {
  const value = map.get(key);
  if (value === undefined) {
    throw new Error(`Seed: referência desconhecida "${String(key)}"`);
  }
  return value;
}
