import Link from 'next/link';
import { Suspense } from 'react';
import type { ReactNode } from 'react';
import {
    ChartNoAxesCombined,
    Clapperboard,
    House,
    LibraryBig,
    MessageSquareText,
} from 'lucide-react';
import { UserMenu } from '@/src/features/auth/presentation/components/UserMenu';
import { AdminNav } from './(admin)/admin-nav';
import { CatalogNav } from './(admin)/catalog-nav';
import { CommunityNav, ModerationNav } from './(community)/community-nav';
import { NavLink } from './_shell/nav-link';
import { sidebarLinkClass, sidebarSectionClass } from './_shell/nav-styles';

const primaryLinks = [
    { href: '/', label: 'Inicio', icon: House },
    { href: '/catalog', label: 'Catálogo', icon: Clapperboard },
    { href: '/library', label: 'Biblioteca', icon: LibraryBig },
    { href: '/reviews', label: 'Reseñas', icon: MessageSquareText },
    { href: '/stats', label: 'Estadísticas', icon: ChartNoAxesCombined },
];

/** Enlaces principales; sin pathname (fallback) se pintan sin marcar el activo. */
function PrimaryLinks({ withActive }: { withActive: boolean }) {
    return primaryLinks.map(({ href, label, icon: Icon }) => {
        const content = (
            <>
                <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                <span>{label}</span>
            </>
        );
        return withActive ? (
            <NavLink key={href} href={href}>
                {content}
            </NavLink>
        ) : (
            <Link key={href} href={href} className={sidebarLinkClass}>
                {content}
            </Link>
        );
    });
}

/**
 * Estructura de las páginas con sesión.
 * - Barra lateral: navegación principal (Inicio, Catálogo, Biblioteca, Reseñas, Estadísticas) y,
 *   según permisos, catálogo, moderación y administración. En móvil pasa a una fila desplazable.
 * - Barra superior: comunidad (listas y actividad), notificaciones y menú de usuario.
 */
export default function AppShell({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-dvh flex-1 flex-col lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)]">
            <aside className="border-b border-white/10 bg-surface/70 lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto lg:border-r lg:border-b-0">
                <div className="flex min-w-0 items-center gap-3 px-4 py-3 lg:flex-col lg:items-stretch lg:gap-7 lg:px-3 lg:py-6">
                    <Link
                        href="/"
                        className="shrink-0 rounded-lg px-1 text-lg font-bold tracking-tight text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand lg:px-3"
                    >
                        Elpepesetch
                    </Link>
                    <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto lg:flex-col lg:items-stretch lg:gap-6 lg:overflow-visible">
                        <nav aria-label="Principal" className={sidebarSectionClass}>
                            <Suspense fallback={<PrimaryLinks withActive={false} />}>
                                <PrimaryLinks withActive />
                            </Suspense>
                        </nav>
                        <Suspense fallback={null}>
                            <CatalogNav />
                        </Suspense>
                        <Suspense fallback={null}>
                            <ModerationNav />
                        </Suspense>
                        <Suspense fallback={null}>
                            <AdminNav />
                        </Suspense>
                    </div>
                </div>
            </aside>
            <div className="flex min-w-0 flex-1 flex-col">
                <header className="sticky top-0 z-30 border-b border-white/10 bg-background/85 backdrop-blur">
                    <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
                        <Suspense fallback={<span />}>
                            <CommunityNav />
                        </Suspense>
                        <Suspense fallback={null}>
                            <UserMenu />
                        </Suspense>
                    </div>
                </header>
                {children}
            </div>
        </div>
    );
}
