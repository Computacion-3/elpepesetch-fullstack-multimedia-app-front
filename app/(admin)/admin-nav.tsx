import { getSession } from '@/src/lib/dal';
import { PERMISSIONS } from '@/src/shared/permissions';
import { NavLink } from '../_shell/nav-link';
import { sidebarSectionClass, sidebarSectionTitleClass } from '../_shell/nav-styles';

/** Sección "Administración" de la barra lateral: solo los paneles que el usuario puede abrir. */
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
        <nav aria-label="Administración" className={sidebarSectionClass}>
            <p className={sidebarSectionTitleClass}>Administración</p>
            {links.map((l) => (
                <NavLink key={l.href} href={l.href}>
                    {l.label}
                </NavLink>
            ))}
        </nav>
    );
}
