import { getSession } from '@/src/lib/dal';
import { PERMISSIONS } from '@/src/shared/permissions';
import { NavLink } from '../_shell/nav-link';
import { sidebarSectionClass, sidebarSectionTitleClass } from '../_shell/nav-styles';

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
        <nav aria-label="Administración del catálogo" className={sidebarSectionClass}>
            <p className={sidebarSectionTitleClass}>Gestión del catálogo</p>
            {links.map((link) => (
                <NavLink key={link.href} href={link.href}>
                    {link.label}
                </NavLink>
            ))}
        </nav>
    );
}
