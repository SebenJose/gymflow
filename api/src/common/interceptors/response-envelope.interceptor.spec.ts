import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { firstValueFrom, of } from 'rxjs';
import { ResponseEnvelopeInterceptor } from './response-envelope.interceptor.js';

describe('ResponseEnvelopeInterceptor', () => {
  // O interceptor não lê o contexto, então um objeto vazio basta.
  const context = {} as ExecutionContext;

  function handlerOf<T>(value: T): CallHandler<T> {
    return { handle: () => of(value) };
  }

  it('envolve o retorno do handler em { success, data }', async () => {
    const interceptor = new ResponseEnvelopeInterceptor<{ id: number }>();

    const result = await firstValueFrom(interceptor.intercept(context, handlerOf({ id: 1 })));

    expect(result).toEqual({ success: true, data: { id: 1 } });
  });

  it('converte retorno vazio em data: null', async () => {
    const interceptor = new ResponseEnvelopeInterceptor<undefined>();

    const result = await firstValueFrom(interceptor.intercept(context, handlerOf(undefined)));

    expect(result).toEqual({ success: true, data: null });
  });
});
