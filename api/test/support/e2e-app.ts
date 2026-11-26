import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request, { type Response } from 'supertest';
import { App } from 'supertest/types.js';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module.js';
import { UserRole } from '../../src/common/types/user-role.js';
import { PasswordHasher } from '../../src/modules/auth/password-hasher.js';
import { User } from '../../src/modules/users/entities/user.entity.js';

export type ResponseBody = {
  success: boolean;
  data: Record<string, unknown> & { accessToken?: unknown; user?: unknown };
  error: { statusCode: number; message: string; details?: string[] };
};

export type Credentials = { name: string; email: string; password: string };

export const ADMIN: Credentials = {
  name: 'Admin',
  email: 'admin@gymflow.dev',
  password: 'senha-admin-123',
};

// O supertest tipa o corpo como `any`; aqui ele é lido no formato do envelope da API.
export function bodyOf(response: Response): ResponseBody {
  return response.body as ResponseBody;
}

/** Sobe a app com o banco limpo e um admin cadastrado (não há cadastro público de admin). */
export async function createE2eApp(): Promise<INestApplication<App>> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication<INestApplication<App>>({ logger: false });
  await app.init();

  const dataSource = app.get(DataSource);
  const tables = dataSource.entityMetadatas.map((entity) => `"${entity.tableName}"`).join(', ');
  await dataSource.query(`TRUNCATE TABLE ${tables} CASCADE`);
  await dataSource.getRepository(User).save({
    name: ADMIN.name,
    email: ADMIN.email,
    passwordHash: await app.get(PasswordHasher).hash(ADMIN.password),
    role: UserRole.Admin,
  });
  return app;
}

export async function login(
  app: INestApplication<App>,
  { email, password }: Pick<Credentials, 'email' | 'password'>,
): Promise<string> {
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password })
    .expect(200);
  const token = bodyOf(response).data.accessToken;
  if (typeof token !== 'string') {
    throw new Error('login sem accessToken');
  }
  return token;
}

export async function registerStudent(
  app: INestApplication<App>,
  student: Credentials,
): Promise<string> {
  await request(app.getHttpServer()).post('/auth/register').send(student).expect(201);
  return login(app, student);
}
