/** Rotas usadas por mais de um lugar (proxy, redirecionamentos, links). */
export const ROUTES = {
  home: '/inicio',
  login: '/entrar',
  register: '/cadastro',
  plans: '/planos',
  workouts: '/treinos',
  /** Route Handler que apaga o cookie de um token rejeitado pela API e volta ao login. */
  sessionExpired: '/sessao-expirada',
} as const;

export const PUBLIC_ROUTES: readonly string[] = [ROUTES.login, ROUTES.register];
