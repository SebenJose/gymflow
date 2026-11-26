import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import type { ApiErrorBody, ApiErrorResponse } from '../types/api-response.type.js';

const INTERNAL_ERROR_MESSAGE = 'Erro interno do servidor';
const VALIDATION_ERROR_MESSAGE = 'Dados inválidos';

type ErrorContent = Pick<ApiErrorBody, 'message' | 'details'>;

/** Converte qualquer exceção no formato padronizado de erro `{ success: false, error }`. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly adapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.adapterHost;
    const ctx = host.switchToHttp();
    const statusCode =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    if (!(exception instanceof HttpException)) {
      this.logger.error(
        exception instanceof Error ? (exception.stack ?? exception.message) : exception,
      );
    }

    const content: ErrorContent =
      exception instanceof HttpException
        ? extractContent(exception)
        : { message: INTERNAL_ERROR_MESSAGE };

    const body: ApiErrorResponse = {
      success: false,
      error: {
        statusCode,
        ...content,
        path: String(httpAdapter.getRequestUrl(ctx.getRequest<unknown>())),
        timestamp: new Date().toISOString(),
      },
    };

    httpAdapter.reply(ctx.getResponse<unknown>(), body, statusCode);
  }
}

function extractContent(exception: HttpException): ErrorContent {
  const response = exception.getResponse();
  if (typeof response === 'string') {
    return { message: response };
  }

  const message: unknown = 'message' in response ? response.message : undefined;
  // O ValidationPipe devolve a lista de violações em `message`.
  if (Array.isArray(message)) {
    return { message: VALIDATION_ERROR_MESSAGE, details: message.map(String) };
  }
  return { message: typeof message === 'string' ? message : exception.message };
}
