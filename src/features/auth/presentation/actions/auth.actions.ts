'use server';

import { createSession, deleteSession, readToken } from '@/src/lib/session';
import type { ActionResult } from '@/src/shared/domain/action-result';
import { describeError } from '@/src/shared/domain/errors';
import { authContainer } from '../../di/auth.container';
import type { SocketTicket } from '../../domain/entities/socket-ticket';
import type { LoginCredentials, RegisterDraft } from '../../domain/entities/user';
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

/** Invalidates the token in the backend and clears the session cookie. */
export async function logoutAction(): Promise<void> {
    const token = await readToken();
    if (token) await authContainer.logout.execute(token);
    await deleteSession();
}
