'use server';

import { createSession, deleteSession, readToken } from '@/src/lib/session';
import type { ActionResult } from '@/src/shared/action-result';
import { describeError } from '@/src/shared/domain/errors';
import { authContainer } from '../../di/auth.container';
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

/** Invalidates the token in the backend and clears the session cookie. */
export async function logoutAction(): Promise<void> {
    const token = await readToken();
    if (token) await authContainer.logout.execute(token);
    await deleteSession();
}
