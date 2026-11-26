import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { DataSource } from 'typeorm';
import { UserRole } from '../src/common/types/user-role.js';
import { GymClass } from '../src/modules/classes/entities/gym-class.entity.js';
import {
  bodyOf,
  createE2eApp,
  createStaffUser,
  login,
  registerStudent,
} from './support/e2e-app.js';

const MISSING_ID = '00000000-0000-4000-8000-000000000000';
const PASSWORD = 'senha-forte-123';
const INSTRUCTOR = { name: 'Iara', email: 'iara@gymflow.dev', password: PASSWORD };
const HOUR_MS = 3_600_000;

describe('Frequência (e2e)', () => {
  let app: INestApplication<App>;
  let instructorToken: string;
  let instructorId: string;
  let heloToken: string;
  let heloId: string;
  let igorToken: string;
  let yogaId: string;
  let spinningId: string;
  let futureId: string;
  let heloYogaBooking: string;
  let heloSpinningBooking: string;
  let igorYogaBooking: string;

  const http = (): ReturnType<typeof request> => request(app.getHttpServer());
  const auth = (token: string): [string, string] => ['Authorization', `Bearer ${token}`];
  const idOf = (body: Record<string, unknown>): string => String(body.id);
  const attendanceOf = (classId: string, bookingId: string): string =>
    `/classes/${classId}/bookings/${bookingId}`;

  async function createClass(name: string): Promise<string> {
    const startsAt = new Date(Date.now() + 24 * HOUR_MS).toISOString();
    const response = await http()
      .post('/classes')
      .set(...auth(instructorToken))
      .send({ name, startsAt, durationMinutes: 45, capacity: 10 })
      .expect(201);
    return idOf(bodyOf(response).data);
  }

  async function book(classId: string, token: string): Promise<string> {
    const response = await http()
      .post(`/classes/${classId}/bookings`)
      .set(...auth(token))
      .expect(201);
    return idOf(bodyOf(response).data);
  }

  /** Não há rota para criar aula no passado; o horário é movido direto no banco. */
  async function moveToPast(classId: string, hoursAgo: number): Promise<void> {
    await app
      .get(DataSource)
      .getRepository(GymClass)
      .update({ id: classId }, { startsAt: new Date(Date.now() - hoursAgo * HOUR_MS) });
  }

  beforeAll(async () => {
    app = await createE2eApp();
    await createStaffUser(app, INSTRUCTOR, UserRole.Instructor);
    instructorToken = await login(app, INSTRUCTOR);
    heloToken = await registerStudent(app, {
      name: 'Helo',
      email: 'helo@gymflow.dev',
      password: PASSWORD,
    });
    igorToken = await registerStudent(app, {
      name: 'Igor',
      email: 'igor@gymflow.dev',
      password: PASSWORD,
    });
    const [instructorMe, heloMe] = await Promise.all([
      http()
        .get('/users/me')
        .set(...auth(instructorToken)),
      http()
        .get('/users/me')
        .set(...auth(heloToken)),
    ]);
    instructorId = idOf(bodyOf(instructorMe).data);
    heloId = idOf(bodyOf(heloMe).data);

    yogaId = await createClass('Yoga');
    spinningId = await createClass('Spinning');
    futureId = await createClass('Pilates');
    heloYogaBooking = await book(yogaId, heloToken);
    heloSpinningBooking = await book(spinningId, heloToken);
    igorYogaBooking = await book(yogaId, igorToken);
    await book(futureId, heloToken);
    await moveToPast(yogaId, 3);
    await moveToPast(spinningId, 1);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('PATCH /classes/:id/bookings/:bookingId', () => {
    it('200 equipe registra presença e falta, e a lista de inscritos mostra', async () => {
      const response = await http()
        .patch(attendanceOf(yogaId, heloYogaBooking))
        .set(...auth(instructorToken))
        .send({ attended: true })
        .expect(200);
      expect(bodyOf(response).data).toMatchObject({ attended: true, student: { name: 'Helo' } });

      await http()
        .patch(attendanceOf(spinningId, heloSpinningBooking))
        .set(...auth(instructorToken))
        .send({ attended: false })
        .expect(200);

      const roster = await http()
        .get(`/classes/${yogaId}/bookings`)
        .set(...auth(instructorToken))
        .expect(200);
      expect(bodyOf(roster).data).toMatchObject([
        { student: { name: 'Helo' }, attended: true },
        { student: { name: 'Igor' }, attended: null },
      ]);
    });

    it('409 antes do início da aula', async () => {
      const bookingId = await book(futureId, igorToken);
      await http()
        .patch(attendanceOf(futureId, bookingId))
        .set(...auth(instructorToken))
        .send({ attended: true })
        .expect(409);
    });

    it('404 para inscrição de outra aula', async () => {
      await http()
        .patch(attendanceOf(spinningId, igorYogaBooking))
        .set(...auth(instructorToken))
        .send({ attended: true })
        .expect(404);
    });

    it('400 sem o campo attended, 403 para aluno, 401 sem token', async () => {
      await http()
        .patch(attendanceOf(yogaId, heloYogaBooking))
        .set(...auth(instructorToken))
        .send({ attended: 'sim' })
        .expect(400);
      await http()
        .patch(attendanceOf(yogaId, heloYogaBooking))
        .set(...auth(heloToken))
        .send({ attended: true })
        .expect(403);
      await http()
        .patch(attendanceOf(yogaId, heloYogaBooking))
        .send({ attended: true })
        .expect(401);
    });
  });

  describe('GET /attendance/me', () => {
    it('200 lista só aulas que já começaram, das mais recentes, com o resumo', async () => {
      const response = await http()
        .get('/attendance/me')
        .set(...auth(heloToken))
        .expect(200);

      expect(bodyOf(response).data).toMatchObject({
        summary: { totalClasses: 2, attended: 1, missed: 1, notRecorded: 0, attendancePercent: 50 },
        classes: [
          { attended: false, class: { name: 'Spinning' } },
          { attended: true, class: { name: 'Yoga', instructor: { id: instructorId } } },
        ],
      });
    });

    it('200 vazio para período sem aulas e 400 para período invertido', async () => {
      const response = await http()
        .get('/attendance/me?from=2030-01-01')
        .set(...auth(heloToken))
        .expect(200);
      expect(bodyOf(response).data).toMatchObject({
        summary: { totalClasses: 0, attendancePercent: null },
        classes: [],
      });

      await http()
        .get('/attendance/me?from=2026-03-10&to=2026-03-01')
        .set(...auth(heloToken))
        .expect(400);
    });

    it('403 para instrutor', async () => {
      await http()
        .get('/attendance/me')
        .set(...auth(instructorToken))
        .expect(403);
    });
  });

  describe('GET /attendance?studentId=', () => {
    it('200 equipe consulta a frequência do aluno', async () => {
      const response = await http()
        .get(`/attendance?studentId=${heloId}`)
        .set(...auth(instructorToken))
        .expect(200);
      expect(bodyOf(response).data).toMatchObject({ summary: { totalClasses: 2, attended: 1 } });
    });

    it('400 sem aluno ou com usuário que não é aluno; 404 aluno inexistente', async () => {
      await http()
        .get('/attendance')
        .set(...auth(instructorToken))
        .expect(400);
      await http()
        .get(`/attendance?studentId=${instructorId}`)
        .set(...auth(instructorToken))
        .expect(400);
      await http()
        .get(`/attendance?studentId=${MISSING_ID}`)
        .set(...auth(instructorToken))
        .expect(404);
    });

    it('403 para aluno', async () => {
      await http()
        .get(`/attendance?studentId=${heloId}`)
        .set(...auth(heloToken))
        .expect(403);
    });
  });
});
