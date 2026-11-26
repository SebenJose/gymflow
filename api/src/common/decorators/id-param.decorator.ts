import { BadRequestException, Param, ParseUUIDPipe } from '@nestjs/common';

/** Lê o parâmetro de rota `:id` (ou outro nome) e exige que seja um UUID. */
export const IdParam = (name = 'id'): ParameterDecorator =>
  Param(
    name,
    new ParseUUIDPipe({
      exceptionFactory: () => new BadRequestException('Identificador inválido'),
    }),
  );
