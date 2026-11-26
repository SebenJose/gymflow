import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication({ logger: false });
    await app.init();
  });

  it('/ (GET) responde no formato padronizado de sucesso', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect({ success: true, data: 'Hello World!' });
  });

  it('rota inexistente responde 404 no formato padronizado de erro', async () => {
    const response = await request(app.getHttpServer()).get('/rota-inexistente').expect(404);

    expect(response.body).toMatchObject({
      success: false,
      error: { statusCode: 404, path: '/rota-inexistente' },
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
