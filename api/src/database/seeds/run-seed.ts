import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../../app.module.js';
import { Clock } from '../../common/clock/clock.js';
import { PasswordHasher } from '../../modules/auth/password-hasher.js';
import { DatabaseSeeder } from './database-seeder.js';
import { SEED_PASSWORD } from './seed-data.js';

/** Sobe só o contexto da aplicação (sem HTTP), para usar a mesma configuração de banco da API. */
async function runSeed(): Promise<void> {
  const logger = new Logger('Seed');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  try {
    const seeder = new DatabaseSeeder(app.get(DataSource), app.get(PasswordHasher), app.get(Clock));
    if ((await seeder.run()) === 'skipped') {
      logger.warn('O banco já tem usuários; nada foi alterado.');
      return;
    }
    logger.log(`Dados de exemplo criados. Senha de todos os usuários: ${SEED_PASSWORD}`);
  } finally {
    await app.close();
  }
}

await runSeed();
