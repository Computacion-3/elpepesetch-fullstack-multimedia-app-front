'use server';

import { createSession, deleteSession, readToken } from '@/src/lib/session';
import { runAuthenticated } from '@/src/lib/run-authenticated';
import type { ActionResult } from '@/src/shared/domain/action-result';
import { describeError } from '@/src/shared/domain/errors';
import { authContainer } from '../../di/auth.container';
import type { SocketTicket } from '../../domain/entities/socket-ticket';
import type { LoginCredentials, ProfileDraft, RegisterDraft } from '../../domain/entities/user';
import { AuthViewModelMapper, type AuthUserViewModel } from '../viewmodels/auth.viewmodel';

/** Logs in and stores the session cookie. */
export async function loginAction(input: LoginCredentials): Promise<ActionResult<AuthUserViewModel>> {
    try {
        const { accessToken, user } = await authContainer.login.execute(input);
        await createSession(accessToken);
        return { ok: true, data: AuthViewModelMapper.toViewModel(user) };
    } catch (err) {
        return { ok: false, message: describeError(err, 'No se pudo iniciar sesión') };
    }
}

/** Creates an account. */
export async function registerAction(input: RegisterDraft): Promise<ActionResult<null>> {
    try {
        await authContainer.register.execute(input);
        return { ok: true, data: null };
    } catch (err) {
        return { ok: false, message: describeError(err, 'No se pudo crear la cuenta') };
    }
}

/**
 * Ticket para el handshake del WebSocket: `io(url, { auth: { token: ticket.token } })`.
 * Corre en el servidor: lee el token de sesión de la cookie httpOnly y le pide al backend un ticket
 * de 60 s y un solo uso. El token de sesión nunca sale del servidor.
 * Pedir uno nuevo en cada (re)conexión (con `auth` como función en socket.io-client).
 */
export async function getSocketTokenAction(): Promise<ActionResult<SocketTicket>> {
    const token = await readToken();
    if (!token) return { ok: false, message: 'No hay una sesión activa' };
    try {
        return { ok: true, data: await authContainer.getSocketTicket.execute(token) };
    } catch (err) {
        return { ok: false, message: describeError(err, 'No se pudo autenticar la conexión en tiempo real') };
    }
}

/** Vuelve a consultar el perfil cuando el rol cambia en otra sesión. */
export async function refreshCurrentUserAction(): Promise<ActionResult<AuthUserViewModel>> {
    return runAuthenticated('No se pudo actualizar tu perfil', async (token) =>
        AuthViewModelMapper.toViewModel(await authContainer.getCurrentUser.execute(token)),
    );
}

/** Edita el perfil propio y devuelve el usuario ya actualizado para el store. */
export async function updateProfileAction(draft: ProfileDraft): Promise<ActionResult<AuthUserViewModel>> {
    return runAuthenticated('No se pudo actualizar tu perfil', async (token) =>
        AuthViewModelMapper.toViewModel(await authContainer.updateProfile.execute(token, draft)),
    );
}

/** Borra la cookie sin intentar usar una sesión que el backend acaba de desactivar. */
export async function expireSessionAction(): Promise<void> {
    await deleteSession();
}

/** Invalidates the token in the backend and clears the session cookie. */
export async function logoutAction(): Promise<void> {
    const token = await readToken();
    if (token) await authContainer.logout.execute(token);
    await deleteSession();
}
