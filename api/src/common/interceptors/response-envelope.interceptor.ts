import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import type { ApiSuccessResponse } from '../types/api-response.type.js';

/** Envolve toda resposta de sucesso no formato padronizado `{ success, data }`. */
@Injectable()
export class ResponseEnvelopeInterceptor<T> implements NestInterceptor<
  T,
  ApiSuccessResponse<T | null>
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiSuccessResponse<T | null>> {
    return next.handle().pipe(map((data) => ({ success: true, data: data ?? null })));
  }
}
