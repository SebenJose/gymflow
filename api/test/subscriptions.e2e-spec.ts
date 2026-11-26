import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { ADMIN, bodyOf, createE2eApp, login, registerStudent } from './support/e2e-app.js';

const MISSING_ID = '00000000-0000-4000-8000-000000000000';

type InvoiceBody = { id: string; status: string; dueDate: string };

describe('Matrículas e mensalidades (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;
  let carlaToken: string;
  let diegoToken: string;
  let planId: string;
  let inactivePlanId: string;
  let carlaSubscriptionId: string;
  let firstInvoiceId: string;

  const http = (): ReturnType<typeof request> => request(app.getHttpServer());
  const auth = (token: string): [string, string] => ['Authorization', `Bearer ${token}`];

  function stringField(value: unknown, name: string): string {
    if (typeof value !== 'string') {
      throw new Error(`resposta sem ${name}`);
    }
    return value;
  }

  async function createPlan(body: Record<string, unknown>): Promise<string> {
    const response = await http()
      .post('/plans')
      .set(...auth(adminToken))
      .send(body)
      .expect(201);
    return stringField(bodyOf(response).data.id, 'id do plano');
  }

  beforeAll(async () => {
    app = await createE2eApp();
    adminToken = await login(app, ADMIN);
    const password = 'senha-forte-123';
    carlaToken = await registerStudent(app, {
      name: 'Carla',
      email: 'carla@gymflow.dev',
      password,
    });
    diegoToken = await registerStudent(app, {
      name: 'Diego',
      email: 'diego@gymflow.dev',
      password,
    });
    planId = await createPlan({ name: 'Trimestral', monthlyPriceCents: 11990, durationMonths: 3 });
    inactivePlanId = await createPlan({
      name: 'Descontinuado',
      monthlyPriceCents: 5000,
      durationMonths: 1,
      isActive: false,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /subscriptions', () => {
    it('201 aluno contrata o plano e recebe as mensalidades', async () => {
      const response = await http()
        .post('/subscriptions')
        .set(...auth(carlaToken))
        .send({ planId })
        .expect(201);

      const data = bodyOf(response).data;
      expect(data).toMatchObject({
        status: 'active',
        monthlyPriceCents: 11990,
        plan: { id: planId, name: 'Trimestral' },
        student: { email: 'carla@gymflow.dev' },
      });
      // Os dados do teste vêm da resposta da API.
      const invoices = data.invoices as InvoiceBody[];
      expect(invoices).toHaveLength(3);
      expect(invoices.every((invoice) => invoice.status === 'pending')).toBe(true);
      carlaSubscriptionId = stringField(data.id, 'id da matrícula');
      firstInvoiceId = stringField(invoices[0]?.id, 'id da mensalidade');
    });

    it('409 quando o aluno já tem matrícula ativa', async () => {
      await http()
        .post('/subscriptions')
        .set(...auth(carlaToken))
        .send({ planId })
        .expect(409);
    });

    it('com duas contratações simultâneas, só uma é aceita', async () => {
      const attempts = await Promise.all([
        http()
          .post('/subscriptions')
          .set(...auth(diegoToken))
          .send({ planId }),
        http()
          .post('/subscriptions')
          .set(...auth(diegoToken))
          .send({ planId }),
      ]);

      expect(attempts.map((attempt) => attempt.status).sort((a, b) => a - b)).toEqual([201, 409]);
    });

    it('404 para plano desativado', async () => {
      const token = await registerStudent(app, {
        name: 'Elisa',
        email: 'elisa@gymflow.dev',
        password: 'senha-forte-123',
      });

      await http()
        .post('/subscriptions')
        .set(...auth(token))
        .send({ planId: inactivePlanId })
        .expect(404);
    });

    it('400 com planId inválido', async () => {
      await http()
        .post('/subscriptions')
        .set(...auth(carlaToken))
        .send({ planId: 'abc' })
        .expect(400);
    });

    it('403 para admin (só aluno contrata)', async () => {
      await http()
        .post('/subscriptions')
        .set(...auth(adminToken))
        .send({ planId })
        .expect(403);
    });

    it('401 sem token', async () => {
      await http().post('/subscriptions').send({ planId }).expect(401);
    });
  });

  describe('consultas', () => {
    it('GET /subscriptions/me 200 lista só as do aluno', async () => {
      const response = await http()
        .get('/subscriptions/me')
        .set(...auth(carlaToken))
        .expect(200);

      expect(bodyOf(response).data).toEqual([expect.objectContaining({ id: carlaSubscriptionId })]);
    });

    it('GET /subscriptions/:id 404 para matrícula de outro aluno', async () => {
      await http()
        .get(`/subscriptions/${carlaSubscriptionId}`)
        .set(...auth(diegoToken))
        .expect(404);
    });

    it('GET /subscriptions 200 admin filtra por situação', async () => {
      const response = await http()
        .get('/subscriptions?status=active')
        .set(...auth(adminToken))
        .expect(200);

      expect(bodyOf(response).data).toHaveLength(2);
    });

    it('GET /subscriptions 400 com situação inválida', async () => {
      await http()
        .get('/subscriptions?status=pausada')
        .set(...auth(adminToken))
        .expect(400);
    });

    it('GET /subscriptions 403 para aluno', async () => {
      await http()
        .get('/subscriptions')
        .set(...auth(carlaToken))
        .expect(403);
    });
  });

  describe('PATCH /invoices/:id/pay', () => {
    it('200 admin registra o pagamento', async () => {
      const response = await http()
        .patch(`/invoices/${firstInvoiceId}/pay`)
        .set(...auth(adminToken))
        .expect(200);

      expect(bodyOf(response).data).toMatchObject({ status: 'paid' });
      expect(bodyOf(response).data.paidAt).toEqual(expect.any(String));
    });

    it('409 ao pagar de novo', async () => {
      await http()
        .patch(`/invoices/${firstInvoiceId}/pay`)
        .set(...auth(adminToken))
        .expect(409);
    });

    it('404 para mensalidade inexistente', async () => {
      await http()
        .patch(`/invoices/${MISSING_ID}/pay`)
        .set(...auth(adminToken))
        .expect(404);
    });

    it('403 para aluno', async () => {
      await http()
        .patch(`/invoices/${firstInvoiceId}/pay`)
        .set(...auth(carlaToken))
        .expect(403);
    });
  });

  describe('PATCH /subscriptions/:id/status', () => {
    it('200 admin cancela e as mensalidades pendentes são canceladas', async () => {
      const response = await http()
        .patch(`/subscriptions/${carlaSubscriptionId}/status`)
        .set(...auth(adminToken))
        .send({ status: 'cancelled' })
        .expect(200);

      const data = bodyOf(response).data;
      expect(data.status).toBe('cancelled');
      // Os dados do teste vêm da resposta da API.
      const statuses = (data.invoices as InvoiceBody[]).map((invoice) => invoice.status);
      expect(statuses).toEqual(['paid', 'cancelled', 'cancelled']);
    });

    it('409 ao reativar matrícula cancelada', async () => {
      await http()
        .patch(`/subscriptions/${carlaSubscriptionId}/status`)
        .set(...auth(adminToken))
        .send({ status: 'active' })
        .expect(409);
    });

    it('201 aluno pode contratar de novo depois do cancelamento', async () => {
      await http()
        .post('/subscriptions')
        .set(...auth(carlaToken))
        .send({ planId })
        .expect(201);
    });

    it('404 para matrícula inexistente', async () => {
      await http()
        .patch(`/subscriptions/${MISSING_ID}/status`)
        .set(...auth(adminToken))
        .send({ status: 'suspended' })
        .expect(404);
    });

    it('403 para aluno', async () => {
      await http()
        .patch(`/subscriptions/${carlaSubscriptionId}/status`)
        .set(...auth(carlaToken))
        .send({ status: 'cancelled' })
        .expect(403);
    });
  });

  describe('DELETE /plans/:id com matrículas', () => {
    it('409 e o plano continua existindo', async () => {
      await http()
        .delete(`/plans/${planId}`)
        .set(...auth(adminToken))
        .expect(409);
      await http()
        .get(`/plans/${planId}`)
        .set(...auth(adminToken))
        .expect(200);
    });
  });
});
