import Link from 'next/link';
import { getSession } from '@/src/lib/dal';
import { PERMISSIONS } from '@/src/shared/permissions';

/**
 * Barra de navegación para los módulos de comunidad y estadísticas (Persona 4).
 * Muestra `Moderación de reportes` únicamente cuando el usuario posee `reviews:moderate`.
 * Se mantiene separada de `AdminNav` (`Administración`) para respetar sus controles de acceso.
 */
export async function CommunityNav() {
    const session = await getSession();
    if (!session) return null;

    const links = [
        {
            href: '/reports',
            label: 'Moderación de reportes',
            visible: session.user.hasPermission(PERMISSIONS.REVIEWS_MODERATE),
        },
    ].filter((link) => link.visible);
    if (links.length === 0) return null;

    return (
        <nav aria-label="Moderación de comunidad" className="flex flex-wrap items-center gap-1">
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
