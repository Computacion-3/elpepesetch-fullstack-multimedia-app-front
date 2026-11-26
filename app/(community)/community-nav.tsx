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
    { href: '/lists', label: 'Mis listas', visible: true },
    { href: '/community/lists', label: 'Explorar listas', visible: true },
    { href: '/reviews', label: 'Reseñas', visible: true },
    { href: '/stats', label: 'Estadísticas', visible: true },
    {
      href: '/reports',
      label: 'Moderación de reportes',
      visible: session.user.hasPermission(PERMISSIONS.REVIEWS_MODERATE),
    },
  ].filter((link) => link.visible);

  return (
    <nav
      aria-label="Comunidad y estadísticas"
      className="flex flex-wrap gap-4 text-sm"
    >
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="font-medium text-brand hover:underline"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
