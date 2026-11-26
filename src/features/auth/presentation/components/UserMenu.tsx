'use client';

import { useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/src/shared/ui/Button';
import { useAuth } from '../hooks/use-auth';
import { NotificationBell } from '@/src/features/notifications/presentation/components/NotificationBell';
import { RealtimeStatus } from '@/src/features/realtime/presentation/components/RealtimeStatus';

const subscribeNoop = () => () => {};

/**
 * Shows the current user and a logout button.
 * Renders only after hydration: the server (and the hydration pass) always see an empty store, while
 * SessionHydrator may fill it on the client first; rendering earlier would cause a hydration mismatch.
 */
export function UserMenu() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const hydrated = useSyncExternalStore(subscribeNoop, () => true, () => false);

    if (!hydrated || !user) return null;

    const handleLogout = async () => {
        await logout();
        router.replace('/login');
    };

    return (
        <div className="flex max-w-full flex-wrap items-center justify-end gap-2 sm:gap-3">
            <NotificationBell />
            <div className="flex min-w-0 max-w-32 flex-col text-right text-sm">
                <span className="truncate font-medium">{user.displayName}</span>
                <span className="truncate text-muted">{user.role}</span>
                <RealtimeStatus />
            </div>
            <Button variant="secondary" onClick={handleLogout}>
                Cerrar sesión
            </Button>
        </div>
    );
}
