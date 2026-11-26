import type { ReactNode } from 'react';
import AppHeader from '@/app/app-header';

/**
 * Layout compartido para las rutas de comunidad y estadísticas (`/reviews`, `/reports`, `/stats`).
 * Replica la estructura visual de `AdminLayout` con navegación superior y menú de usuario.
 */
export default function CommunityLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-full flex-col">
            <AppHeader />
            <main className="mx-auto w-full max-w-5xl flex-1 p-6">{children}</main>
        </div>
    );
}
