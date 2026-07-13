import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE = process.env.NEXT_PUBLIC_SESSION_COOKIE ?? 'mindcat_session';

const PROTECTED_PREFIXES = ['/hoje', '/diario', '/humor', '/tarefas', '/perfil', '/pro', '/admin'];
const GUEST_ONLY = ['/login', '/registro', '/esqueci-a-senha', '/redefinir-senha'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (!hasSession && PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('proximo', pathname);
    return NextResponse.redirect(url);
  }

  if (hasSession && GUEST_ONLY.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/hoje'; 
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|webp)$).*)'],
};