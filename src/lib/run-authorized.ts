import 'server-only';
import type { ActionResult } from '@/src/shared/domain/action-result';
import { describeError } from '@/src/shared/domain/errors';
import { getAuthorizedSession } from './dal';

/**
 * Runs `task` with the caller's access token after re-checking the permission on the server.
 * `task` must return serializable data (view models) because the result crosses the Server Action boundary.
 */
export async function runAuthorized<T>(
    permission: string,
    fallbackMessage: string,
    task: (accessToken: string) => Promise<T>,
): Promise<ActionResult<T>> {
    const session = await getAuthorizedSession(permission);
    if (!session) return { ok: false, message: 'No tienes permiso para realizar esta acción' };
    try {
        return { ok: true, data: await task(session.accessToken) };
    } catch (err) {
        return { ok: false, message: describeError(err, fallbackMessage) };
    }
}
