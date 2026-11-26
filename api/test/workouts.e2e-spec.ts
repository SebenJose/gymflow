import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { UserRole } from '../src/common/types/user-role.js';
import {
  ADMIN,
  bodyOf,
  createE2eApp,
  createStaffUser,
  login,
  registerStudent,
} from './support/e2e-app.js';

const MISSING_ID = '00000000-0000-4000-8000-000000000000';
const INSTRUCTOR = { name: 'Ivo Instrutor', email: 'ivo@gymflow.dev', password: 'senha-forte-123' };

type ExerciseBody = { id: string; name: string; position: number };

describe('Fichas de treino (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;
  let instructorToken: string;
  let fabiToken: string;
  let gabiToken: string;
  let fabiId: string;
  let instructorId: string;
  let workoutId: string;
  let firstExerciseId: string;

  const http = (): ReturnType<typeof request> => request(app.getHttpServer());
  const auth = (token: string): [string, string] => ['Authorization', `Bearer ${token}`];

  function stringField(value: unknown, name: string): string {
    if (typeof value !== 'string') {
      throw new Error(`resposta sem ${name}`);
    }
    return value;
  }

  async function idOf(token: string): Promise<string> {
    const response = await http()
      .get('/users/me')
      .set(...auth(token))
      .expect(200);
    return stringField(bodyOf(response).data.id, 'id do usuário');
  }

  const workoutBody = (): Record<string, unknown> => ({
    studentId: fabiId,
    name: 'Treino A — Pernas',
    notes: 'Aquecer 10 minutos antes',
    exercises: [
      { name: 'Agachamento livre', sets: 4, reps: 10, loadKg: 40.5, restSeconds: 90 },
      { name: 'Leg press', sets: 3, reps: 12 },
    ],
  });

  beforeAll(async () => {
    app = await createE2eApp();
    adminToken = await login(app, ADMIN);
    await createStaffUser(app, INSTRUCTOR, UserRole.Instructor);
    instructorToken = await login(app, INSTRUCTOR);
    instructorId = await idOf(instructorToken);
    const password = 'senha-forte-123';
    fabiToken = await registerStudent(app, { name: 'Fabi', email: 'fabi@gymflow.dev', password });
    gabiToken = await registerStudent(app, { name: 'Gabi', email: 'gabi@gymflow.dev', password });
    fabiId = await idOf(fabiToken);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /workouts', () => {
    it('201 instrutor cria a ficha com os exercícios em ordem', async () => {
      const response = await http()
        .post('/workouts')
        .set(...auth(instructorToken))
        .send(workoutBody())
        .expect(201);

      const data = bodyOf(response).data;
      expect(data).toMatchObject({
        name: 'Treino A — Pernas',
        student: { id: fabiId, name: 'Fabi' },
        instructor: { id: instructorId, name: INSTRUCTOR.name },
      });
      // Os dados do teste vêm da resposta da API.
      const exercises = data.exercises as ExerciseBody[];
      expect(exercises.map((exercise) => [exercise.position, exercise.name])).toEqual([
        [0, 'Agachamento livre'],
        [1, 'Leg press'],
      ]);
      expect(exercises[1]).toMatchObject({ loadKg: null, restSeconds: null });
      workoutId = stringField(data.id, 'id da ficha');
      firstExerciseId = stringField(exercises[0]?.id, 'id do exercício');
    });

    it('400 quando o usuário informado não é aluno', async () => {
      await http()
        .post('/workouts')
        .set(...auth(instructorToken))
        .send({ ...workoutBody(), studentId: instructorId })
        .expect(400);
    });

    it('400 com exercício inválido', async () => {
      await http()
        .post('/workouts')
        .set(...auth(instructorToken))
        .send({ ...workoutBody(), exercises: [{ name: 'Supino', sets: 0, reps: 10 }] })
        .expect(400);
    });

    it('400 sem exercícios', async () => {
      const response = await http()
        .post('/workouts')
        .set(...auth(instructorToken))
        .send({ ...workoutBody(), exercises: [] })
        .expect(400);

      expect(bodyOf(response).error.details).toContain('A ficha deve ter pelo menos 1 exercício');
    });

    it('404 para aluno inexistente', async () => {
      await http()
        .post('/workouts')
        .set(...auth(instructorToken))
        .send({ ...workoutBody(), studentId: MISSING_ID })
        .expect(404);
    });

    it('403 para aluno', async () => {
      await http()
        .post('/workouts')
        .set(...auth(fabiToken))
        .send(workoutBody())
        .expect(403);
    });

    it('401 sem token', async () => {
      await http().post('/workouts').send(workoutBody()).expect(401);
    });
  });

  describe('consultas', () => {
    it('GET /workouts/me 200 aluno vê as próprias fichas', async () => {
      const response = await http()
        .get('/workouts/me')
        .set(...auth(fabiToken))
        .expect(200);

      expect(bodyOf(response).data).toEqual([expect.objectContaining({ id: workoutId })]);
    });

    it('GET /workouts/me 200 vazio para aluno sem ficha', async () => {
      const response = await http()
        .get('/workouts/me')
        .set(...auth(gabiToken))
        .expect(200);

      expect(bodyOf(response).data).toEqual([]);
    });

    it('GET /workouts/:id 404 para ficha de outro aluno', async () => {
      await http()
        .get(`/workouts/${workoutId}`)
        .set(...auth(gabiToken))
        .expect(404);
    });

    it('GET /workouts?studentId= 200 instrutor filtra por aluno', async () => {
      const response = await http()
        .get(`/workouts?studentId=${fabiId}`)
        .set(...auth(instructorToken))
        .expect(200);

      expect(bodyOf(response).data).toHaveLength(1);
    });

    it('GET /workouts 403 para aluno', async () => {
      await http()
        .get('/workouts')
        .set(...auth(fabiToken))
        .expect(403);
    });

    it('GET /users 200 instrutor lista só alunos', async () => {
      const response = await http()
        .get('/users')
        .set(...auth(instructorToken))
        .expect(200);

      const roles = (bodyOf(response).data as unknown as { role: string }[]).map((u) => u.role);
      expect(new Set(roles)).toEqual(new Set([UserRole.Student]));
    });

    it('GET /users?role=admin 403 para instrutor', async () => {
      await http()
        .get('/users?role=admin')
        .set(...auth(instructorToken))
        .expect(403);
    });
  });

  describe('edição', () => {
    it('PATCH /workouts/:id 200 renomeia a ficha', async () => {
      const response = await http()
        .patch(`/workouts/${workoutId}`)
        .set(...auth(instructorToken))
        .send({ name: 'Treino A — Inferiores' })
        .expect(200);

      expect(bodyOf(response).data).toMatchObject({ name: 'Treino A — Inferiores' });
    });

    it('POST /workouts/:id/exercises 201 adiciona ao fim da ficha', async () => {
      const response = await http()
        .post(`/workouts/${workoutId}/exercises`)
        .set(...auth(adminToken))
        .send({ name: 'Cadeira extensora', sets: 3, reps: 15 })
        .expect(201);

      expect(bodyOf(response).data).toMatchObject({ name: 'Cadeira extensora', position: 2 });
    });

    it('PATCH /workouts/:id/exercises/:exerciseId 200 atualiza a carga', async () => {
      const response = await http()
        .patch(`/workouts/${workoutId}/exercises/${firstExerciseId}`)
        .set(...auth(instructorToken))
        .send({ loadKg: 45 })
        .expect(200);

      expect(bodyOf(response).data).toMatchObject({ name: 'Agachamento livre', loadKg: 45 });
    });

    it('PATCH exercício 404 quando não pertence à ficha', async () => {
      await http()
        .patch(`/workouts/${workoutId}/exercises/${MISSING_ID}`)
        .set(...auth(instructorToken))
        .send({ reps: 8 })
        .expect(404);
    });

    it('PATCH exercício 403 para aluno', async () => {
      await http()
        .patch(`/workouts/${workoutId}/exercises/${firstExerciseId}`)
        .set(...auth(fabiToken))
        .send({ reps: 1 })
        .expect(403);
    });

    it('DELETE /workouts/:id/exercises/:exerciseId 204 remove o exercício', async () => {
      await http()
        .delete(`/workouts/${workoutId}/exercises/${firstExerciseId}`)
        .set(...auth(instructorToken))
        .expect(204);

      const response = await http()
        .get(`/workouts/${workoutId}`)
        .set(...auth(fabiToken));
      const names = (bodyOf(response).data.exercises as ExerciseBody[]).map((e) => e.name);
      expect(names).toEqual(['Leg press', 'Cadeira extensora']);
    });
  });

  describe('DELETE /workouts/:id', () => {
    it('403 para aluno', async () => {
      await http()
        .delete(`/workouts/${workoutId}`)
        .set(...auth(fabiToken))
        .expect(403);
    });

    it('204 instrutor remove a ficha', async () => {
      await http()
        .delete(`/workouts/${workoutId}`)
        .set(...auth(instructorToken))
        .expect(204);
    });

    it('404 depois de removida', async () => {
      await http()
        .get(`/workouts/${workoutId}`)
        .set(...auth(instructorToken))
        .expect(404);
    });
  });
});
