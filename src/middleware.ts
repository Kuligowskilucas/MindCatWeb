import { NextResponse, type NextRequest } from 'next/server';


const AUTH_COOKIE = process.env.NEXT_PUBLIC_AUTH_COOKIE ?? 'mindcat_auth';

const PROTECTED_PREFIXES = ['/hoje', '/diario', '/tarefas', '/perfil', '/pro', '/admin'];
const GUEST_ONLY = ['/login', '/registro', '/esqueci-a-senha', '/redefinir-senha'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authed = request.cookies.has(AUTH_COOKIE);

  if (!authed && PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('proximo', pathname);
    return NextResponse.redirect(url);
  }

  if (authed && GUEST_ONLY.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/hoje';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|webp)$).*)'],
};