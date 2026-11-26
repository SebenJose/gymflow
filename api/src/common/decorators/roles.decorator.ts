import { Reflector } from '@nestjs/core';
import type { UserRole } from '../types/user-role.js';

/** Restringe a rota aos papéis informados, ex.: `@Roles([UserRole.Admin])`. */
export const Roles = Reflector.createDecorator<UserRole[]>();
