import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

/** Registra método, rota, status e duração de cada requisição. */
@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const startedAt = performance.now();

    response.on('finish', () => {
      const durationMs = Math.round(performance.now() - startedAt);
      const line = `${request.method} ${request.originalUrl} ${response.statusCode} ${durationMs}ms`;
      if (response.statusCode >= HTTP_SERVER_ERROR) {
        this.logger.error(line);
      } else if (response.statusCode >= HTTP_CLIENT_ERROR) {
        this.logger.warn(line);
      } else {
        this.logger.log(line);
      }
    });

    next();
  }
}

const HTTP_CLIENT_ERROR = 400;
const HTTP_SERVER_ERROR = 500;
