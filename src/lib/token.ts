import { jwtDecode } from 'jwt-decode';

export const SESSION_COOKIE = 'session';

export interface TokenPayload {
    sub: string;
    email: string;
    exp: number;
}

/**
 * Solo decodifica el token (no verifica la firma ni el vencimiento); null si falta o está mal formado.
 * Es la que usa el servidor al renderizar: con cacheComponents, Next no permite leer la hora
 * (Date.now) durante el prerender. Un token vencido lo rechaza el backend con 401.
 */
export function decodeClaims(token?: string): TokenPayload | null {
    if (!token) return null;
    try {
        return jwtDecode<TokenPayload>(token);
    } catch {
        return null;
    }
}

/** Decodifica y además descarta el token vencido. Para proxy.ts, que corre en cada petición (no se prerenderiza). */
export function decodeToken(token?: string): TokenPayload | null {
    const payload = decodeClaims(token);
    return payload && payload.exp * 1000 > Date.now() ? payload : null;
}
