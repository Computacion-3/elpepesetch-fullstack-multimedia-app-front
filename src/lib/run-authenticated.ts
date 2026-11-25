import 'server-only';
import type { ActionResult } from '@/src/shared/domain/action-result';
import { describeError } from '@/src/shared/domain/errors';
import { getSession } from './dal';

/** Ejecuta una lectura autenticada sin exigir permiso administrativo específico. */
export async function runAuthenticated<T>(
    fallbackMessage: string,
    task: (accessToken: string) => Promise<T>,
): Promise<ActionResult<T>> {
    const session = await getSession();
    if (!session) return { ok: false, message: 'Inicia sesión para consultar el catálogo' };
    try {
        return { ok: true, data: await task(session.accessToken) };
    } catch (error) {
        return { ok: false, message: describeError(error, fallbackMessage) };
    }
}
