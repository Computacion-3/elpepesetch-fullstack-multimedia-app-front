import Link from 'next/link';
import { getSession } from '@/src/lib/dal';
import { PERMISSIONS } from '@/src/shared/permissions';

const linkClassName =
    'rounded-lg px-3 py-2 text-sm font-medium text-brand transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

/**
 * Navegación de comunidad: `Comunidad` (listas propias, listas públicas y actividad) para toda sesión
 * y `Moderación de comunidad` (`Moderación de reportes`) solo con `reviews:moderate`.
 * Se mantiene separada de `AdminNav` (`Administración`) para respetar sus controles de acceso.
 */
export async function CommunityNav() {
    const session = await getSession();
    if (!session) return null;

    const communityLinks = [
        { href: '/lists', label: 'Mis listas' },
        { href: '/community/lists', label: 'Explorar listas' },
        { href: '/activity', label: 'Actividad' },
    ];
    const moderationLinks = [
        {
            href: '/reports',
            label: 'Moderación de reportes',
            visible: session.user.hasPermission(PERMISSIONS.REVIEWS_MODERATE),
        },
    ].filter((link) => link.visible);

    return (
        <>
            <nav aria-label="Comunidad" className="flex flex-wrap items-center gap-1">
                {communityLinks.map((link) => (
                    <Link key={link.href} href={link.href} className={linkClassName}>
                        {link.label}
                    </Link>
                ))}
            </nav>
            {moderationLinks.length > 0 && (
                <nav aria-label="Moderación de comunidad" className="flex flex-wrap items-center gap-1">
                    {moderationLinks.map((link) => (
                        <Link key={link.href} href={link.href} className={linkClassName}>
                            {link.label}
                        </Link>
                    ))}
                </nav>
            )}
        </>
    );
}
