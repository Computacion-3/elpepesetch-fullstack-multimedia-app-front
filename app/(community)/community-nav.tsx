import { getSession } from '@/src/lib/dal';
import { PERMISSIONS } from '@/src/shared/permissions';
import { NavLink } from '../_shell/nav-link';
import { sidebarSectionClass, sidebarSectionTitleClass } from '../_shell/nav-styles';

/** Barra superior "Comunidad": listas propias, listas públicas y actividad, para toda sesión. */
export async function CommunityNav() {
    const session = await getSession();
    if (!session) return <span />;

    const links = [
        { href: '/lists', label: 'Mis listas' },
        { href: '/community/lists', label: 'Explorar listas' },
        { href: '/activity', label: 'Actividad' },
    ];

    return (
        <nav aria-label="Comunidad" className="flex min-w-0 items-center gap-1 overflow-x-auto">
            {links.map((link) => (
                <NavLink key={link.href} href={link.href} variant="top">
                    {link.label}
                </NavLink>
            ))}
        </nav>
    );
}

/**
 * Sección "Moderación de comunidad" de la barra lateral: solo con `reviews:moderate`.
 * Se mantiene separada de `AdminNav` (`Administración`) para respetar sus controles de acceso.
 */
export async function ModerationNav() {
    const session = await getSession();
    if (!session?.user.hasPermission(PERMISSIONS.REVIEWS_MODERATE)) return null;

    return (
        <nav aria-label="Moderación de comunidad" className={sidebarSectionClass}>
            <p className={sidebarSectionTitleClass}>Moderación</p>
            <NavLink href="/reports">Moderación de reportes</NavLink>
        </nav>
    );
}
