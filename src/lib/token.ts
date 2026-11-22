import { jwtDecode } from 'jwt-decode';

export const SESSION_COOKIE = 'session';

export interface TokenPayload {
    sub: string;
    email: string;
    exp: number;
}

/** Solo decodifica el token (no verifica la firma); devuelve null si falta, es inválido o expiró. */
export function decodeToken(token?: string): TokenPayload | null {
    if (!token) return null;
    try {
        const payload = jwtDecode<TokenPayload>(token);
        if (payload.exp * 1000 <= Date.now()) return null;
        return payload;
    } catch {
        return null;
    }
}
