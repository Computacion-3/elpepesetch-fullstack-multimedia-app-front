import Link from 'next/link';
import { getSession } from '@/src/lib/dal';
import { PERMISSIONS } from '@/src/shared/permissions';

/**
 * Navegación del catálogo y moderación de propuestas/géneros (Persona 2).
 * Se mantiene separada de `AdminNav` (`Administración`) para conservar la separación
 * de privilegios entre catálogo y administración de seguridad.
 */
export async function CatalogNav() {
    const session = await getSession();
    if (!session) return null;

    const links = [
        { href: '/media/pending', label: 'Propuestas', permission: PERMISSIONS.CATALOG_MODERATE },
        { href: '/genres', label: 'Géneros', permission: PERMISSIONS.GENRES_MANAGE },
    ].filter((link) => !link.permission || session.user.hasPermission(link.permission));

    if (links.length === 0) return null;

    return (
        <nav aria-label="Administración del catálogo" className="flex flex-wrap items-center gap-1">
            {links.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-brand transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                    {link.label}
                </Link>
            ))}
        </nav>
    );
}
