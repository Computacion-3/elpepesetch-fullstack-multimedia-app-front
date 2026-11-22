import 'server-only';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, decodeToken } from './token';

/** Guarda el token en una cookie httpOnly que expira junto con el token. */
export async function createSession(token: string): Promise<void> {
    const payload = decodeToken(token);
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

/** Devuelve el token de la cookie solo si sigue siendo válido. */
export async function readToken(): Promise<string | null> {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    return decodeToken(token) ? (token as string) : null;
}
