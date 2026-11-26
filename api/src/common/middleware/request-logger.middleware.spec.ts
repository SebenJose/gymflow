import { EventEmitter } from 'node:events';
import { Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { RequestLoggerMiddleware } from './request-logger.middleware.js';

describe('RequestLoggerMiddleware', () => {
  function run(statusCode: number): void {
    const response = Object.assign(new EventEmitter(), { statusCode });
    const request = { method: 'GET', originalUrl: '/api/plans' };
    const next = vi.fn();

    // Só as propriedades lidas pelo middleware são fornecidas.
    new RequestLoggerMiddleware().use(request as Request, response as unknown as Response, next);

    expect(next).toHaveBeenCalledOnce();
    response.emit('finish');
  }

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    [200, 'log'],
    [404, 'warn'],
    [500, 'error'],
  ] as const)('registra status %i com nível %s', (statusCode, level) => {
    const spy = vi.spyOn(Logger.prototype, level).mockImplementation(() => undefined);

    run(statusCode);

    expect(spy).toHaveBeenCalledWith(
      expect.stringMatching(new RegExp(`^GET /api/plans ${statusCode} \\d+ms$`)),
    );
  });
});
