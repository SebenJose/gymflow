import { type CustomDecorator, SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Libera a rota do guard de JWT, que é global. */
export const Public = (): CustomDecorator => SetMetadata(IS_PUBLIC_KEY, true);
