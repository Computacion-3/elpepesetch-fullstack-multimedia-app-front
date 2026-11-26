import Link from 'next/link';
import { Suspense } from 'react';
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
import { CommunityNav } from './(community)/community-nav';

const primaryLinks = [
    { href: '/', label: 'Inicio', icon: House },
    { href: '/catalog', label: 'Catálogo', icon: Clapperboard },
    { href: '/library', label: 'Biblioteca', icon: LibraryBig },
    { href: '/reviews', label: 'Reseñas', icon: MessageSquareText },
    { href: '/stats', label: 'Estadísticas', icon: ChartNoAxesCombined },
];

const navLinkClassName =
    'rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

export default function AppHeader() {
    return (
        <header className="w-full border-b border-white/10 bg-surface/90 px-4 py-4 shadow-lg shadow-black/10 backdrop-blur sm:px-6">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href="/"
                        className="rounded-lg text-lg font-bold tracking-tight text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
                    >
                        Elpepesetch
                    </Link>
                    <Suspense fallback={null}>
                        <UserMenu />
                    </Suspense>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <nav aria-label="Principal" className="flex flex-wrap items-center gap-1">
                        {primaryLinks.map((link) => (
                            <Link key={link.href} href={link.href} className={navLinkClassName}>
                                <link.icon size={16} strokeWidth={1.8} aria-hidden="true" />
                                <span>{link.label}</span>
                            </Link>
                        ))}
                    </nav>
                    <Suspense fallback={null}>
                        <AdminNav />
                    </Suspense>
                    <Suspense fallback={null}>
                        <CatalogNav />
                    </Suspense>
                    <Suspense fallback={null}>
                        <CommunityNav />
                    </Suspense>
                </div>
            </div>
        </header>
    );
}
