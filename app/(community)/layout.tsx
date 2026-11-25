import Link from 'next/link';
import { Suspense } from 'react';
import type { ReactNode } from 'react';
import { UserMenu } from '@/src/features/auth/presentation/components/UserMenu';
import { CommunityNav } from './community-nav';

/**
 * Layout compartido para las rutas de comunidad y estadísticas (`/reviews`, `/reports`, `/stats`).
 * Replica la estructura visual de `AdminLayout` con navegación superior y menú de usuario.
 */
export default function CommunityLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-full flex-col">
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-300 px-6 py-4">
                <div className="flex flex-wrap items-center gap-6">
                    <Link href="/" className="text-lg font-semibold">
                        Elpepesetch
                    </Link>
                    <Suspense fallback={null}>
                        <CommunityNav />
                    </Suspense>
                </div>
                <UserMenu />
            </header>
            <main className="mx-auto w-full max-w-5xl flex-1 p-6">{children}</main>
        </div>
    );
}
