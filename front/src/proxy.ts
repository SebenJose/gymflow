import { type NextRequest, NextResponse } from 'next/server';
import { PUBLIC_ROUTES, ROUTES } from './lib/routes';
import { SESSION_COOKIE } from './lib/session/session-cookie';

/**
 * Checagem otimista, só pela presença do cookie: evita renderizar telas privadas sem sessão
 * e o login com sessão. A validade do token é conferida pela API em cada chamada.
 */
export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);
  const isPublic = PUBLIC_ROUTES.includes(pathname);

  if (!hasSession && !isPublic) {
    return NextResponse.redirect(new URL(ROUTES.login, request.url));
  }
  if (hasSession && isPublic) {
    return NextResponse.redirect(new URL(ROUTES.home, request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Fora: arquivos do Next, estáticos e o encerramento de sessão (que precisa rodar sem sessão válida).
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sessao-expirada|.*\\.(?:svg|png|jpg|ico)$).*)',
  ],
};
