import 'server-only';
import { forbidden, redirect } from 'next/navigation';
import { cache } from 'react';
import { authContainer } from '@/src/features/auth/di/auth.container';
import type { User } from '@/src/features/auth/domain/entities/user';
import { readToken } from './session';

export type Session = { accessToken: string; user: User };

/** Current session (memoized per request); null when there is no token or the backend rejects it. */
export const getSession = cache(async (): Promise<Session | null> => {
    const accessToken = await readToken();
    if (!accessToken) return null;
    try {
        const user = await authContainer.getCurrentUser.execute(accessToken);
        return { accessToken, user };
    } catch {
        return null;
    }
});

/** Returns the session or redirects to /login. */
export async function requireSession(): Promise<Session> {
    const session = await getSession();
    if (!session) redirect('/login');
    return session;
}

/** Returns the session or renders the forbidden page when the user lacks the permission. */
export async function requirePermission(permission: string): Promise<Session> {
    const session = await requireSession();
    if (!session.user.hasPermission(permission)) forbidden();
    return session;
}

/** Session only when the user holds the permission; null otherwise (for Server Actions, which must not redirect). */
export async function getAuthorizedSession(permission: string): Promise<Session | null> {
    const session = await getSession();
    return session?.user.hasPermission(permission) ? session : null;
}
