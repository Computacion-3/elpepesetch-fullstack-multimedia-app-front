import type { ReactNode } from 'react';
import AppShell from '@/app/app-shell';

/**
 * Layout compartido para las rutas de comunidad y estadísticas (`/reviews`, `/reports`, `/stats`).
 * Usa la misma estructura que el resto de páginas con sesión (`AppShell`).
 */
export default function CommunityLayout({ children }: { children: ReactNode }) {
    return (
        <AppShell>
            <main className="mx-auto w-full max-w-5xl flex-1 p-6">{children}</main>
        </AppShell>
    );
}
