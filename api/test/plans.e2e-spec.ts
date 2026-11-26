import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { ADMIN, bodyOf, createE2eApp, login, registerStudent } from './support/e2e-app.js';

const MONTHLY = { name: 'Mensal', monthlyPriceCents: 12990, durationMonths: 1 };
const MISSING_ID = '00000000-0000-4000-8000-000000000000';

describe('Planos (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;
  let studentToken: string;
  let monthlyId: string;

  function http(): ReturnType<typeof request> {
    return request(app.getHttpServer());
  }

  beforeAll(async () => {
    app = await createE2eApp();
    adminToken = await login(app, ADMIN);
    studentToken = await registerStudent(app, {
      name: 'Bruno Aluno',
      email: 'bruno@gymflow.dev',
      password: 'senha-forte-123',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /plans', () => {
    it('201 admin cria um plano', async () => {
      const response = await http()
        .post('/plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...MONTHLY, description: 'Acesso livre à musculação' })
        .expect(201);

      expect(bodyOf(response).data).toMatchObject({ ...MONTHLY, isActive: true });
      const id = bodyOf(response).data.id;
      if (typeof id !== 'string') {
        throw new Error('plano sem id');
      }
      monthlyId = id;
    });

    it('409 com nome repetido', async () => {
      await http()
        .post('/plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(MONTHLY)
        .expect(409);
    });

    it('400 com dados inválidos', async () => {
      const response = await http()
        .post('/plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Quebrado', monthlyPriceCents: 10.5, durationMonths: 0 })
        .expect(400);

      expect(bodyOf(response).error.details).toEqual(
        expect.arrayContaining([
          'A mensalidade deve ser um valor inteiro em centavos',
          'A duração mínima é de 1 mês',
        ]),
      );
    });

    it('401 sem token', async () => {
      await http().post('/plans').send(MONTHLY).expect(401);
    });

    it('403 para aluno', async () => {
      await http()
        .post('/plans')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ ...MONTHLY, name: 'Pirata' })
        .expect(403);
    });
  });

  describe('GET /plans', () => {
    beforeAll(async () => {
      await http()
        .post('/plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Plano antigo', monthlyPriceCents: 5000, durationMonths: 1, isActive: false })
        .expect(201);
    });

    it('200 aluno vê só os planos ativos', async () => {
      const response = await http()
        .get('/plans')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(bodyOf(response).data).toEqual([expect.objectContaining({ name: 'Mensal' })]);
    });

    it('200 admin vê também os desativados com includeInactive=true', async () => {
      const response = await http()
        .get('/plans?includeInactive=true')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(bodyOf(response).data).toHaveLength(2);
    });

    it('403 quando aluno pede os desativados', async () => {
      await http()
        .get('/plans?includeInactive=true')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });

    it('400 com includeInactive inválido', async () => {
      await http()
        .get('/plans?includeInactive=talvez')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });
  });

  describe('GET /plans/:id', () => {
    it('200 retorna o plano', async () => {
      const response = await http()
        .get(`/plans/${monthlyId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(bodyOf(response).data).toMatchObject(MONTHLY);
    });

    it('400 com id que não é UUID', async () => {
      const response = await http()
        .get('/plans/abc')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(400);

      expect(bodyOf(response).error.message).toBe('Identificador inválido');
    });

    it('404 com id inexistente', async () => {
      await http()
        .get(`/plans/${MISSING_ID}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(404);
    });
  });

  describe('PATCH /plans/:id', () => {
    it('200 admin altera o preço', async () => {
      const response = await http()
        .patch(`/plans/${monthlyId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ monthlyPriceCents: 13990 })
        .expect(200);

      expect(bodyOf(response).data).toMatchObject({ name: 'Mensal', monthlyPriceCents: 13990 });
    });

    it('404 com id inexistente', async () => {
      await http()
        .patch(`/plans/${MISSING_ID}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ monthlyPriceCents: 1 })
        .expect(404);
    });

    it('403 para aluno', async () => {
      await http()
        .patch(`/plans/${monthlyId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ monthlyPriceCents: 1 })
        .expect(403);
    });
  });

  describe('DELETE /plans/:id', () => {
    it('403 para aluno', async () => {
      await http()
        .delete(`/plans/${monthlyId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });

    it('204 admin remove o plano', async () => {
      await http()
        .delete(`/plans/${monthlyId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
    });

    it('404 ao remover de novo', async () => {
      await http()
        .delete(`/plans/${monthlyId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});
