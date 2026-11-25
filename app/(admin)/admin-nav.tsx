import Link from 'next/link';
import { getSession } from '@/src/lib/dal';
import { PERMISSIONS } from '@/src/shared/permissions';

export async function AdminNav() {
    const session = await getSession();
    if (!session) return null;
    const links = [
        { href: '/catalog', label: 'Catálogo', permission: null },
        { href: '/media/pending', label: 'Propuestas', permission: PERMISSIONS.CATALOG_MODERATE },
        { href: '/genres', label: 'Géneros', permission: PERMISSIONS.GENRES_MANAGE },
        { href: '/users', label: 'Usuarios', permission: PERMISSIONS.USERS_MANAGE },
        { href: '/roles', label: 'Roles', permission: PERMISSIONS.ROLES_MANAGE },
        { href: '/permissions', label: 'Permisos', permission: PERMISSIONS.PERMISSIONS_MANAGE },
    ].filter((link) => !link.permission || session.user.hasPermission(link.permission));
    if (links.length === 0) return null;
    return (
        <nav aria-label="Administración" className="flex gap-4 text-sm">
            {links.map((l) => (
                <Link key={l.href} href={l.href} className="font-medium text-brand hover:underline">
                    {l.label}
                </Link>
            ))}
        </nav>
    );
}
