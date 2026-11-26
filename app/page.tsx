import { Suspense } from 'react';
import AppHeader from '@/app/app-header';
import { HomeDashboard } from '@/src/features/stats/presentation/components/HomeDashboard';
import { requireSession } from '@/src/lib/dal';

async function AuthenticatedHome() {
    const { user } = await requireSession();
    return <HomeDashboard displayName={user.fullName ?? user.username} />;
}

export default function Home() {
    return (
        <div className="flex min-h-full flex-col">
            <AppHeader />
            <main className="w-full flex-1 px-4 py-7 sm:px-6 sm:py-10">
                <Suspense
                    fallback={
                        <p role="status" className="mx-auto max-w-6xl text-sm text-muted">
                            Cargando tu inicio…
                        </p>
                    }
                >
                    <AuthenticatedHome />
                </Suspense>
            </main>
        </div>
    );
}
