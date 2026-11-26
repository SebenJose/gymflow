import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { formatDateInTimeZone, BUSINESS_TIME_ZONE } from '../src/common/clock/clock.js';
import { UserRole } from '../src/common/types/user-role.js';
import {
  bodyOf,
  createE2eApp,
  createStaffUser,
  login,
  registerStudent,
} from './support/e2e-app.js';

const MISSING_ID = '00000000-0000-4000-8000-000000000000';
const INSTRUCTOR = { name: 'Iara', email: 'iara@gymflow.dev', password: 'senha-forte-123' };

type ExerciseBody = { id: string };
type CompletionBody = { exerciseName: string; loadKg: number | null; completedOn: string };

describe('Conclusão de exercícios (e2e)', () => {
  let app: INestApplication<App>;
  let instructorToken: string;
  let heloToken: string;
  let igorToken: string;
  let heloId: string;
  let workoutId: string;
  let squatId: string;
  let pressId: string;

  const http = (): ReturnType<typeof request> => request(app.getHttpServer());
  const auth = (token: string): [string, string] => ['Authorization', `Bearer ${token}`];
  const completionsOf = (exerciseId: string): string =>
    `/workouts/${workoutId}/exercises/${exerciseId}/completions`;
  const today = formatDateInTimeZone(new Date(), BUSINESS_TIME_ZONE);

  function stringField(value: unknown, name: string): string {
    if (typeof value !== 'string') {
      throw new Error(`resposta sem ${name}`);
    }
    return value;
  }

  beforeAll(async () => {
    app = await createE2eApp();
    await createStaffUser(app, INSTRUCTOR, UserRole.Instructor);
    instructorToken = await login(app, INSTRUCTOR);
    const password = 'senha-forte-123';
    heloToken = await registerStudent(app, { name: 'Helo', email: 'helo@gymflow.dev', password });
    igorToken = await registerStudent(app, { name: 'Igor', email: 'igor@gymflow.dev', password });
    const me = await http()
      .get('/users/me')
      .set(...auth(heloToken));
    heloId = stringField(bodyOf(me).data.id, 'id do aluno');

    const response = await http()
      .post('/workouts')
      .set(...auth(instructorToken))
      .send({
        studentId: heloId,
        name: 'Treino B',
        exercises: [
          { name: 'Agachamento', sets: 4, reps: 10, loadKg: 40 },
          { name: 'Supino', sets: 3, reps: 12 },
        ],
      })
      .expect(201);
    workoutId = stringField(bodyOf(response).data.id, 'id da ficha');
    // Os dados do teste vêm da resposta da API.
    const exercises = bodyOf(response).data.exercises as ExerciseBody[];
    squatId = stringField(exercises[0]?.id, 'id do agachamento');
    pressId = stringField(exercises[1]?.id, 'id do supino');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST .../completions', () => {
    it('201 aluno conclui um exercício da própria ficha', async () => {
      const response = await http()
        .post(completionsOf(squatId))
        .set(...auth(heloToken))
        .expect(201);

      expect(bodyOf(response).data).toMatchObject({
        exerciseId: squatId,
        workoutName: 'Treino B',
        exerciseName: 'Agachamento',
        sets: 4,
        reps: 10,
        loadKg: 40,
        completedOn: today,
      });
    });

    it('409 ao concluir o mesmo exercício de novo no dia', async () => {
      await http()
        .post(completionsOf(squatId))
        .set(...auth(heloToken))
        .expect(409);
    });

    it('404 na ficha de outro aluno', async () => {
      await http()
        .post(completionsOf(pressId))
        .set(...auth(igorToken))
        .expect(404);
    });

    it('404 para exercício que não é da ficha', async () => {
      await http()
        .post(completionsOf(MISSING_ID))
        .set(...auth(heloToken))
        .expect(404);
    });

    it('400 com id inválido', async () => {
      await http()
        .post(completionsOf('abc'))
        .set(...auth(heloToken))
        .expect(400);
    });

    it('403 para instrutor (só o aluno registra)', async () => {
      await http()
        .post(completionsOf(pressId))
        .set(...auth(instructorToken))
        .expect(403);
    });

    it('401 sem token', async () => {
      await http().post(completionsOf(pressId)).expect(401);
    });
  });

  describe('DELETE .../completions/today', () => {
    it('204 desfaz e permite concluir de novo', async () => {
      await http()
        .post(completionsOf(pressId))
        .set(...auth(heloToken))
        .expect(201);
      await http()
        .delete(`${completionsOf(pressId)}/today`)
        .set(...auth(heloToken))
        .expect(204);
      await http()
        .post(completionsOf(pressId))
        .set(...auth(heloToken))
        .expect(201);
    });

    it('404 quando não há conclusão hoje', async () => {
      await http()
        .delete(`${completionsOf(pressId)}/today`)
        .set(...auth(heloToken))
        .expect(204);
      await http()
        .delete(`${completionsOf(pressId)}/today`)
        .set(...auth(heloToken))
        .expect(404);
    });
  });

  describe('histórico', () => {
    it('GET /completions/me 200 lista o histórico do aluno no período', async () => {
      const response = await http()
        .get(`/completions/me?from=${today}&to=${today}`)
        .set(...auth(heloToken))
        .expect(200);

      // Os dados do teste vêm da resposta da API.
      const names = (bodyOf(response).data as unknown as CompletionBody[]).map(
        (completion) => completion.exerciseName,
      );
      expect(names).toEqual(['Agachamento']);
    });

    it('GET /completions/me 200 vazio para outro aluno', async () => {
      const response = await http()
        .get('/completions/me')
        .set(...auth(igorToken))
        .expect(200);

      expect(bodyOf(response).data).toEqual([]);
    });

    it('400 com data fora do formato', async () => {
      await http()
        .get('/completions/me?from=10/03/2026')
        .set(...auth(heloToken))
        .expect(400);
    });

    it('400 com período invertido', async () => {
      await http()
        .get('/completions/me?from=2026-03-10&to=2026-03-01')
        .set(...auth(heloToken))
        .expect(400);
    });

    it('GET /completions?studentId= 200 instrutor acompanha o aluno', async () => {
      const response = await http()
        .get(`/completions?studentId=${heloId}`)
        .set(...auth(instructorToken))
        .expect(200);

      expect(bodyOf(response).data).toHaveLength(1);
    });

    it('GET /completions 403 para aluno', async () => {
      await http()
        .get('/completions')
        .set(...auth(heloToken))
        .expect(403);
    });

    it('o histórico continua depois que a ficha é removida', async () => {
      await http()
        .delete(`/workouts/${workoutId}`)
        .set(...auth(instructorToken))
        .expect(204);

      const response = await http()
        .get('/completions/me')
        .set(...auth(heloToken))
        .expect(200);
      expect(bodyOf(response).data).toEqual([
        expect.objectContaining({ exerciseName: 'Agachamento', workoutId: null, exerciseId: null }),
      ]);
    });
  });
});
