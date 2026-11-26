import {
  type ArgumentsHost,
  BadRequestException,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { HttpAdapterHost } from '@nestjs/core';
import { AllExceptionsFilter } from './all-exceptions.filter.js';

describe('AllExceptionsFilter', () => {
  const request = { url: '/api/plans/1' };
  const response = {};
  const reply = vi.fn<(response: unknown, body: unknown, statusCode: number) => void>();
  const adapterHost = {
    httpAdapter: { reply, getRequestUrl: vi.fn(() => request.url) },
  } as unknown as HttpAdapterHost; // só os métodos usados pelo filtro
  const host = {
    switchToHttp: () => ({ getRequest: () => request, getResponse: () => response }),
  } as unknown as ArgumentsHost; // só o contexto HTTP é usado

  let filter: AllExceptionsFilter;

  function lastReply(): { body: unknown; statusCode: number | undefined } {
    const [target, body, statusCode] = reply.mock.lastCall ?? [];
    expect(target).toBe(response);
    return { body, statusCode };
  }

  beforeEach(() => {
    reply.mockClear();
    filter = new AllExceptionsFilter(adapterHost);
  });

  it('usa status e mensagem da HttpException', () => {
    filter.catch(new NotFoundException('Plano não encontrado'), host);

    const { body, statusCode } = lastReply();
    expect(statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(body).toMatchObject({
      success: false,
      error: {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Plano não encontrado',
        path: '/api/plans/1',
      },
    });
  });

  it('expõe as violações do ValidationPipe em details', () => {
    filter.catch(
      new BadRequestException(['name should not be empty', 'price must be a number']),
      host,
    );

    const { body, statusCode } = lastReply();
    expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(body).toMatchObject({
      success: false,
      error: {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Dados inválidos',
        details: ['name should not be empty', 'price must be a number'],
      },
    });
  });

  it('responde 500 com mensagem genérica para erro desconhecido, sem vazar detalhes', () => {
    const logError = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    filter.catch(new Error('connection refused at 10.0.0.1'), host);

    const { body, statusCode } = lastReply();
    expect(statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(body).toMatchObject({
      success: false,
      error: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Erro interno do servidor',
      },
    });
    expect(logError).toHaveBeenCalled();
    logError.mockRestore();
  });
});
