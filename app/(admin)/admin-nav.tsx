import Link from 'next/link';
import { getSession } from '@/src/lib/dal';
import { PERMISSIONS } from '@/src/shared/permissions';

export async function AdminNav() {
    const session = await getSession();
    if (!session) return null;
    const links = [
        { href: '/users', label: 'Usuarios', permission: PERMISSIONS.USERS_MANAGE },
        { href: '/roles', label: 'Roles', permission: PERMISSIONS.ROLES_MANAGE },
        { href: '/permissions', label: 'Permisos', permission: PERMISSIONS.PERMISSIONS_MANAGE },
    ].filter((l) => session.user.hasPermission(l.permission));
    if (links.length === 0) return null;
    return (
        <nav aria-label="Administración" className="flex flex-wrap items-center gap-1">
            {links.map((l) => (
                <Link
                    key={l.href}
                    href={l.href}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-brand transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                    {l.label}
                </Link>
            ))}
        </nav>
    );
}
