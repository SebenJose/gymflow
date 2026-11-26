import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { DataSource } from 'typeorm';
import { Clock } from '../src/common/clock/clock.js';
import { DatabaseSeeder } from '../src/database/seeds/database-seeder.js';
import { SEED_PASSWORD } from '../src/database/seeds/seed-data.js';
import { PasswordHasher } from '../src/modules/auth/password-hasher.js';
import { bodyOf, createE2eApp, login, truncateAll } from './support/e2e-app.js';

type ClassBody = { name: string; availableSpots: number };
type InvoiceBody = { status: string; dueDate: string };

describe('Seed (e2e)', () => {
  let app: INestApplication<App>;
  let seeder: DatabaseSeeder;
  let anaToken: string;

  const http = (): ReturnType<typeof request> => request(app.getHttpServer());
  const auth = (token: string): [string, string] => ['Authorization', `Bearer ${token}`];
  const loginAs = (email: string): Promise<string> =>
    login(app, { email, password: SEED_PASSWORD });

  beforeAll(async () => {
    app = await createE2eApp();
    // O seed só roda com o banco vazio; o admin criado pelo helper é removido.
    await truncateAll(app);
    seeder = new DatabaseSeeder(app.get(DataSource), app.get(PasswordHasher), app.get(Clock));
    await expect(seeder.run()).resolves.toBe('seeded');
    anaToken = await loginAs('ana@gymflow.dev');
  });

  afterAll(async () => {
    await app.close();
  });

  it('cria usuários dos três papéis com a senha documentada', async () => {
    const adminToken = await loginAs('admin@gymflow.dev');
    const response = await http()
      .get('/users')
      .set(...auth(adminToken))
      .expect(200);
    expect(bodyOf(response).data).toHaveLength(7);
    await loginAs('carla@gymflow.dev');
  });

  it('lista só os planos ativos para o aluno', async () => {
    const response = await http()
      .get('/plans')
      .set(...auth(anaToken))
      .expect(200);
    expect(bodyOf(response).data).toHaveLength(3);
  });

  it('a matrícula do Bruno tem mensalidade vencida e pendente', async () => {
    const response = await http()
      .get('/subscriptions/me')
      .set(...auth(await loginAs('bruno@gymflow.dev')))
      .expect(200);
    // Os dados do teste vêm da resposta da API.
    const [subscription] = bodyOf(response).data as unknown as { invoices: InvoiceBody[] }[];
    const today = app.get(Clock).today();
    expect(
      subscription?.invoices.some(({ status, dueDate }) => status === 'pending' && dueDate < today),
    ).toBe(true);
  });

  it('a Ana tem fichas, exercícios concluídos e frequência registrada', async () => {
    const workouts = await http()
      .get('/workouts/me')
      .set(...auth(anaToken))
      .expect(200);
    expect(bodyOf(workouts).data).toHaveLength(2);

    const completions = await http()
      .get('/completions/me')
      .set(...auth(anaToken))
      .expect(200);
    expect(bodyOf(completions).data).toHaveLength(9);

    const attendance = await http()
      .get('/attendance/me')
      .set(...auth(anaToken))
      .expect(200);
    expect(bodyOf(attendance).data).toMatchObject({
      summary: { totalClasses: 2, attended: 2, attendancePercent: 100 },
    });
  });

  it('as próximas aulas incluem uma lotada, que recusa inscrição', async () => {
    const response = await http()
      .get('/classes')
      .set(...auth(anaToken))
      .expect(200);
    // Os dados do teste vêm da resposta da API.
    const classes = bodyOf(response).data as unknown as (ClassBody & { id: string })[];
    const full = classes.find((gymClass) => gymClass.availableSpots === 0);
    expect(full?.name).toBe('Pilates');

    await http()
      .post(`/classes/${full?.id ?? ''}/bookings`)
      .set(...auth(await loginAs('diego@gymflow.dev')))
      .expect(409);
  });

  it('não roda de novo com o banco já populado', async () => {
    await expect(seeder.run()).resolves.toBe('skipped');
  });
});
