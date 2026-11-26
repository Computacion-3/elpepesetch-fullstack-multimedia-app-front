import 'server-only';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, decodeClaims } from './token';

/** Guarda el token en una cookie httpOnly que expira junto con el token. */
export async function createSession(token: string): Promise<void> {
    const payload = decodeClaims(token);
    if (!payload) throw new Error('Token inválido');
    (await cookies()).set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        expires: new Date(payload.exp * 1000),
    });
}

/** Elimina la cookie de sesión. */
export async function deleteSession(): Promise<void> {
    (await cookies()).delete(SESSION_COOKIE);
}

/**
 * Devuelve el token de la cookie si tiene forma de JWT. No compara el vencimiento con la hora
 * (prohibido durante el prerender): si venció, el backend responde 401 y getSession() devuelve null.
 * proxy.ts ya redirige a /login las peticiones con el token vencido.
 */
export async function readToken(): Promise<string | null> {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    return decodeClaims(token) ? (token as string) : null;
}
