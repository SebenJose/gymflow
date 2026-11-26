import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request, { type Response } from 'supertest';
import { App } from 'supertest/types.js';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module.js';
import { UserRole } from '../src/common/types/user-role.js';
import { PasswordHasher } from '../src/modules/auth/password-hasher.js';
import { User } from '../src/modules/users/entities/user.entity.js';

const STUDENT = { name: 'Ana Aluna', email: 'ana@gymflow.dev', password: 'senha-forte-123' };
const ADMIN = { name: 'Admin', email: 'admin@gymflow.dev', password: 'senha-admin-123' };

type ResponseBody = {
  success: boolean;
  data: Record<string, unknown> & { accessToken?: unknown; user?: unknown };
  error: { statusCode: number; details?: string[] };
};

// O supertest tipa o corpo como `any`; aqui ele é lido no formato do envelope da API.
function bodyOf(response: Response): ResponseBody {
  return response.body as ResponseBody;
}

describe('Auth e usuários (e2e)', () => {
  let app: INestApplication<App>;

  async function login(email: string, password: string): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200);
    const token: unknown = bodyOf(response).data.accessToken;
    if (typeof token !== 'string') {
      throw new Error('login sem accessToken');
    }
    return token;
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication({ logger: false });
    await app.init();

    const dataSource = app.get(DataSource);
    await dataSource.query('TRUNCATE TABLE users CASCADE');
    // Não há cadastro público de admin, então ele é inserido direto no banco.
    await dataSource.getRepository(User).save({
      name: ADMIN.name,
      email: ADMIN.email,
      passwordHash: await app.get(PasswordHasher).hash(ADMIN.password),
      role: UserRole.Admin,
    });
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
