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
        { href: '/catalog', label: 'Catálogo', permission: null },
        { href: '/media/pending', label: 'Propuestas', permission: PERMISSIONS.CATALOG_MODERATE },
        { href: '/genres', label: 'Géneros', permission: PERMISSIONS.GENRES_MANAGE },
    ].filter((link) => !link.permission || session.user.hasPermission(link.permission));

    return (
        <nav aria-label="Catálogo" className="flex flex-wrap gap-4 text-sm">
            {links.map((link) => (
                <Link key={link.href} href={link.href} className="font-medium text-brand hover:underline">
                    {link.label}
                </Link>
            ))}
        </nav>
    );
}
