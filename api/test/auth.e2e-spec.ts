import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { UserRole } from '../src/common/types/user-role.js';
import { ADMIN, bodyOf, createE2eApp, login as loginAs } from './support/e2e-app.js';

const STUDENT = { name: 'Ana Aluna', email: 'ana@gymflow.dev', password: 'senha-forte-123' };

describe('Auth e usuários (e2e)', () => {
  let app: INestApplication<App>;

  function login(email: string, password: string): Promise<string> {
    return loginAs(app, { email, password });
  }

  beforeAll(async () => {
    app = await createE2eApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('201 cria um aluno e não expõe a senha', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(STUDENT)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: { user: { email: STUDENT.email, role: UserRole.Student } },
      });
      expect(typeof bodyOf(response).data.accessToken).toBe('string');
      expect(bodyOf(response).data.user).not.toHaveProperty('passwordHash');
      expect(bodyOf(response).data.user).not.toHaveProperty('password');
    });

    it('409 quando o e-mail já está cadastrado (sem diferenciar maiúsculas)', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...STUDENT, email: STUDENT.email.toUpperCase() })
        .expect(409);
    });

    it('400 com os erros de validação em details', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ name: '', email: 'invalido', password: '123' })
        .expect(400);

      expect(bodyOf(response).error.details).toEqual(
        expect.arrayContaining(['Informe um e-mail válido']),
      );
    });

    it('400 quando o corpo tem campos não permitidos', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...STUDENT, email: 'outro@gymflow.dev', role: UserRole.Admin })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('200 retorna o token com credenciais válidas', async () => {
      await expect(login(STUDENT.email, STUDENT.password)).resolves.toEqual(expect.any(String));
    });

    it('401 com senha errada', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: STUDENT.email, password: 'senha-errada' })
        .expect(401);
    });

    it('401 com e-mail inexistente', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'ninguem@gymflow.dev', password: STUDENT.password })
        .expect(401);
    });
  });

  describe('GET /users/me', () => {
    it('401 sem token', async () => {
      await request(app.getHttpServer()).get('/users/me').expect(401);
    });

    it('401 com token inválido', async () => {
      await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer token-falso')
        .expect(401);
    });

    it('200 retorna o usuário do token', async () => {
      const token = await login(STUDENT.email, STUDENT.password);

      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(bodyOf(response).data).toMatchObject({ email: STUDENT.email, role: UserRole.Student });
    });
  });

  describe('GET /users (somente admin)', () => {
    it('403 para aluno', async () => {
      const token = await login(STUDENT.email, STUDENT.password);

      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('200 para admin, sem expor senhas', async () => {
      const token = await login(ADMIN.email, ADMIN.password);

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(bodyOf(response).data).toHaveLength(2);
      expect(JSON.stringify(response.body)).not.toContain('passwordHash');
    });
  });
});
