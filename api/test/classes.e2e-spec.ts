import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { DataSource } from 'typeorm';
import { UserRole } from '../src/common/types/user-role.js';
import { GymClass } from '../src/modules/classes/entities/gym-class.entity.js';
import {
  ADMIN,
  bodyOf,
  createE2eApp,
  createStaffUser,
  login,
  registerStudent,
} from './support/e2e-app.js';

const MISSING_ID = '00000000-0000-4000-8000-000000000000';
const PASSWORD = 'senha-forte-123';
const INSTRUCTOR = { name: 'Iara', email: 'iara@gymflow.dev', password: PASSWORD };
const DAY_MS = 86_400_000;
const CONCURRENT_STUDENTS = 6;

type ClassBody = { id: string; bookedCount: number; availableSpots: number };

describe('Aulas coletivas (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;
  let instructorToken: string;
  let studentTokens: string[];
  let instructorId: string;

  const http = (): ReturnType<typeof request> => request(app.getHttpServer());
  const auth = (token: string): [string, string] => ['Authorization', `Bearer ${token}`];
  const inDays = (days: number): string => new Date(Date.now() + days * DAY_MS).toISOString();
  const student = (index: number): string => {
    const token = studentTokens[index];
    if (token === undefined) {
      throw new Error(`aluno ${index} não cadastrado`);
    }
    return token;
  };

  async function createClass(capacity: number, startsAt = inDays(1)): Promise<string> {
    const response = await http()
      .post('/classes')
      .set(...auth(instructorToken))
      .send({ name: 'Spinning', startsAt, durationMinutes: 45, capacity })
      .expect(201);
    return String(bodyOf(response).data.id);
  }

  async function classBody(id: string): Promise<ClassBody> {
    const response = await http()
      .get(`/classes/${id}`)
      .set(...auth(student(0)))
      .expect(200);
    // Os dados do teste vêm da resposta da API.
    return bodyOf(response).data as unknown as ClassBody;
  }

  beforeAll(async () => {
    app = await createE2eApp();
    adminToken = await login(app, ADMIN);
    await createStaffUser(app, INSTRUCTOR, UserRole.Instructor);
    instructorToken = await login(app, INSTRUCTOR);
    const me = await http()
      .get('/users/me')
      .set(...auth(instructorToken));
    instructorId = String(bodyOf(me).data.id);
    studentTokens = await Promise.all(
      Array.from({ length: CONCURRENT_STUDENTS }, (_, index) =>
        registerStudent(app, {
          name: `Aluno ${index}`,
          email: `aluno${index}@gymflow.dev`,
          password: PASSWORD,
        }),
      ),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe('cadastro de aulas', () => {
    it('201 instrutor cria aula e fica como responsável', async () => {
      const response = await http()
        .post('/classes')
        .set(...auth(instructorToken))
        .send({ name: 'Yoga', startsAt: inDays(2), durationMinutes: 60, capacity: 10 })
        .expect(201);

      expect(bodyOf(response).data).toMatchObject({
        name: 'Yoga',
        instructor: { id: instructorId, name: 'Iara' },
        capacity: 10,
        bookedCount: 0,
        availableSpots: 10,
      });
    });

    it('400 com horário sem fuso, no passado ou responsável que não é instrutor', async () => {
      const base = { name: 'Yoga', durationMinutes: 60, capacity: 10 };
      await http()
        .post('/classes')
        .set(...auth(adminToken))
        .send({ ...base, startsAt: '2030-01-10T18:00:00' })
        .expect(400);
      await http()
        .post('/classes')
        .set(...auth(adminToken))
        .send({ ...base, startsAt: inDays(-1) })
        .expect(400);
      const me = await http()
        .get('/users/me')
        .set(...auth(student(0)));
      await http()
        .post('/classes')
        .set(...auth(adminToken))
        .send({ ...base, startsAt: inDays(1), instructorId: bodyOf(me).data.id })
        .expect(400);
    });

    it('403 para aluno e 401 sem token', async () => {
      const body = { name: 'Yoga', startsAt: inDays(1), durationMinutes: 60, capacity: 10 };
      await http()
        .post('/classes')
        .set(...auth(student(0)))
        .send(body)
        .expect(403);
      await http().post('/classes').send(body).expect(401);
    });

    it('GET /classes 200 lista as aulas do período em ordem de horário', async () => {
      const response = await http()
        .get('/classes')
        .set(...auth(student(0)))
        .expect(200);
      expect(bodyOf(response).data).toEqual([expect.objectContaining({ name: 'Yoga' })]);

      await http()
        .get('/classes?from=2030-01-10&to=2030-01-01')
        .set(...auth(student(0)))
        .expect(400);
    });

    it('PATCH 409 ao reduzir vagas abaixo dos inscritos e 404 para aula inexistente', async () => {
      const id = await createClass(3);
      await http()
        .post(`/classes/${id}/bookings`)
        .set(...auth(student(0)))
        .expect(201);
      await http()
        .post(`/classes/${id}/bookings`)
        .set(...auth(student(1)))
        .expect(201);

      await http()
        .patch(`/classes/${id}`)
        .set(...auth(adminToken))
        .send({ capacity: 1 })
        .expect(409);
      await http()
        .patch(`/classes/${MISSING_ID}`)
        .set(...auth(adminToken))
        .send({ capacity: 5 })
        .expect(404);
    });

    it('DELETE 204 remove a aula com as inscrições', async () => {
      const id = await createClass(3);
      await http()
        .post(`/classes/${id}/bookings`)
        .set(...auth(student(0)))
        .expect(201);
      await http()
        .delete(`/classes/${id}`)
        .set(...auth(adminToken))
        .expect(204);
      await http()
        .get(`/classes/${id}`)
        .set(...auth(student(0)))
        .expect(404);
    });
  });

  describe('inscrições', () => {
    it('201 inscreve, ocupa a vaga e aparece em /bookings/me e na lista da equipe', async () => {
      const id = await createClass(5);
      const response = await http()
        .post(`/classes/${id}/bookings`)
        .set(...auth(student(2)))
        .expect(201);
      expect(bodyOf(response).data).toMatchObject({
        class: { id, bookedCount: 1, availableSpots: 4 },
      });

      const mine = await http()
        .get('/bookings/me')
        .set(...auth(student(2)))
        .expect(200);
      expect(bodyOf(mine).data).toMatchObject([{ class: { id } }]);

      const roster = await http()
        .get(`/classes/${id}/bookings`)
        .set(...auth(instructorToken))
        .expect(200);
      expect(bodyOf(roster).data).toMatchObject([{ student: { name: 'Aluno 2' } }]);
    });

    it('409 para inscrição repetida, sem ocupar outra vaga', async () => {
      const id = await createClass(5);
      await http()
        .post(`/classes/${id}/bookings`)
        .set(...auth(student(0)))
        .expect(201);
      await http()
        .post(`/classes/${id}/bookings`)
        .set(...auth(student(0)))
        .expect(409);

      expect((await classBody(id)).bookedCount).toBe(1);
    });

    it('inscrições simultâneas nunca passam do número de vagas', async () => {
      const capacity = 2;
      const id = await createClass(capacity);

      const responses = await Promise.all(
        studentTokens.map((token) =>
          http()
            .post(`/classes/${id}/bookings`)
            .set(...auth(token)),
        ),
      );

      const statuses = responses.map((response) => response.status).sort((a, b) => a - b);
      expect(statuses).toEqual([201, 201, 409, 409, 409, 409]);
      expect(await classBody(id)).toMatchObject({ bookedCount: capacity, availableSpots: 0 });
    });

    it('DELETE 204 cancela e libera a vaga; 404 se não estava inscrito', async () => {
      const id = await createClass(1);
      await http()
        .post(`/classes/${id}/bookings`)
        .set(...auth(student(0)))
        .expect(201);
      await http()
        .delete(`/classes/${id}/bookings/me`)
        .set(...auth(student(0)))
        .expect(204);
      await http()
        .delete(`/classes/${id}/bookings/me`)
        .set(...auth(student(0)))
        .expect(404);

      await http()
        .post(`/classes/${id}/bookings`)
        .set(...auth(student(1)))
        .expect(201);
    });

    it('409 ao inscrever ou cancelar depois que a aula começou', async () => {
      const id = await createClass(5);
      await http()
        .post(`/classes/${id}/bookings`)
        .set(...auth(student(0)))
        .expect(201);
      // Não há rota para criar aula no passado; o horário é movido direto no banco.
      await app
        .get(DataSource)
        .getRepository(GymClass)
        .update({ id }, { startsAt: new Date(Date.now() - DAY_MS / 24) });

      await http()
        .post(`/classes/${id}/bookings`)
        .set(...auth(student(1)))
        .expect(409);
      await http()
        .delete(`/classes/${id}/bookings/me`)
        .set(...auth(student(0)))
        .expect(409);
    });

    it('404 para aula inexistente, 400 para id inválido', async () => {
      await http()
        .post(`/classes/${MISSING_ID}/bookings`)
        .set(...auth(student(0)))
        .expect(404);
      await http()
        .post('/classes/abc/bookings')
        .set(...auth(student(0)))
        .expect(400);
    });

    it('403 para instrutor se inscrever e para aluno ver a lista de inscritos', async () => {
      const id = await createClass(5);
      await http()
        .post(`/classes/${id}/bookings`)
        .set(...auth(instructorToken))
        .expect(403);
      await http()
        .get(`/classes/${id}/bookings`)
        .set(...auth(student(0)))
        .expect(403);
    });
  });
});
