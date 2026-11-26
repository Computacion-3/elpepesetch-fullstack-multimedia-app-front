import { Suspense } from 'react';
import AppShell from '@/app/app-shell';
import { HomeDashboard } from '@/src/features/stats/presentation/components/HomeDashboard';
import { requireSession } from '@/src/lib/dal';
import { Spinner } from '@/src/shared/ui/Spinner';

async function AuthenticatedHome() {
    const { user } = await requireSession();
    return <HomeDashboard displayName={user.fullName ?? user.username} />;
}

export default function Home() {
    return (
        <AppShell>
            <main className="w-full flex-1 px-4 py-7 sm:px-6 sm:py-10">
                <Suspense fallback={<Spinner label="Cargando tu inicio" size="lg" className="py-20" />}>
                    <AuthenticatedHome />
                </Suspense>
            </main>
        </AppShell>
    );
}
