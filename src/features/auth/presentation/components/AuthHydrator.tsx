'use client';

import { useEffect } from 'react';
import type { AuthUserViewModel } from '../viewmodels/auth.viewmodel';
import { useAuth } from '../hooks/use-auth';

/** Copies the server-resolved user into the store. */
export function AuthHydrator({ user }: { user: AuthUserViewModel | null }) {
    const { hydrate } = useAuth();

    useEffect(() => {
        hydrate(user);
    }, [hydrate, user]);

    return null;
}
