'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/src/shared/ui/Button';
import { useAuth } from '../hooks/use-auth';

/** Shows the current user and a logout button. */
export function UserMenu() {
    const router = useRouter();
    const { user, logout } = useAuth();

    if (!user) return null;

    const handleLogout = async () => {
        await logout();
        router.replace('/login');
    };

    return (
        <div className="flex items-center gap-3">
            <div className="flex flex-col text-right text-sm">
                <span className="font-medium">{user.displayName}</span>
                <span className="text-gray-500">{user.role}</span>
            </div>
            <Button variant="secondary" onClick={handleLogout}>
                Cerrar sesión
            </Button>
        </div>
    );
}
