'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { NotificationBell } from '@/src/features/notifications/presentation/components/NotificationBell';
import { RealtimeStatus } from '@/src/features/realtime/presentation/components/RealtimeStatus';

const subscribeNoop = () => () => {};

/**
 * Notificaciones, acceso al perfil (avatar, nombre, rol y estado en tiempo real) y cierre de sesión.
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
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <NotificationBell />
            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-surface/80 p-1">
                <Link
                    href="/profile"
                    aria-label={`Mi perfil: ${user.displayName}`}
                    className="flex min-w-0 items-center gap-2.5 rounded-full py-0.5 pr-1 pl-0.5 transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:pr-3"
                >
                    <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-[#17132b]">
                        <span aria-hidden="true">{user.initials || '?'}</span>
                        <RealtimeStatus className="absolute -right-0.5 -bottom-0.5" />
                    </span>
                    <span className="hidden min-w-0 flex-col leading-tight sm:flex">
                        <span className="max-w-36 truncate text-sm font-semibold">{user.displayName}</span>
                        <span className="text-[11px] font-semibold tracking-wide text-muted">{user.role}</span>
                    </span>
                </Link>
                <button
                    type="button"
                    onClick={handleLogout}
                    aria-label="Cerrar sesión"
                    title="Cerrar sesión"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-white/10 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                    <LogOut size={17} strokeWidth={1.9} aria-hidden="true" />
                </button>
            </div>
        </div>
    );
}
