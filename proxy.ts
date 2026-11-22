import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, decodeToken } from '@/src/lib/token';

const publicRoutes = ['/login', '/register'];

// Un usuario autenticado NO se redirige fuera de /login a propósito (evita un bucle si la cookie existe pero el backend revocó el token).
export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isPublic = publicRoutes.includes(pathname);
    const hasSession = decodeToken(request.cookies.get(SESSION_COOKIE)?.value) !== null;
    if (!isPublic && !hasSession) return NextResponse.redirect(new URL('/login', request.url));
    return NextResponse.next();
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'] };
