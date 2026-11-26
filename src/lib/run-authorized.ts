import 'server-only';
import type { ActionResult } from '@/src/shared/domain/action-result';
import { describeError } from '@/src/shared/domain/errors';
import { getAuthorizedSession, getSession, type Session } from './dal';

/**
 * Ejecuta `task` con el token de acceso del usuario autenticado después de verificar
 * en el servidor que posee el permiso requerido (`permission`).
 * El resultado debe ser serializable (ViewModels o datos planos) porque cruza la frontera de Server Action.
 */
export async function runAuthorized<T>(
    permission: string,
    fallbackMessage: string,
    task: (accessToken: string, session: Session) => Promise<T>,
): Promise<ActionResult<T>> {
    const session = await getAuthorizedSession(permission);
    if (!session) return { ok: false, message: 'No tienes permiso para realizar esta acción' };
    try {
        return { ok: true, data: await task(session.accessToken, session) };
    } catch (err) {
        return { ok: false, message: describeError(err, fallbackMessage) };
    }
}

/**
 * Ejecuta `task` con el token de acceso del usuario autenticado (sin exigir un permiso específico).
 * Útil para endpoints protegidos únicamente por sesión JWT, como listar reseñas visibles
 * o consultar estadísticas personales.
 */
export async function runAuthenticated<T>(
    fallbackMessage: string,
    task: (accessToken: string, session: Session) => Promise<T>,
): Promise<ActionResult<T>> {
    const session = await getSession();
    if (!session) return { ok: false, message: 'Debes iniciar sesión para realizar esta acción' };
    try {
        return { ok: true, data: await task(session.accessToken, session) };
    } catch (err) {
        return { ok: false, message: describeError(err, fallbackMessage) };
    }
}
