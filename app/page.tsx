import { Suspense } from 'react';
import { AdminNav } from '@/app/(admin)/admin-nav';
import { CatalogNav } from '@/app/(admin)/catalog-nav';
import { CommunityNav } from '@/app/(community)/community-nav';
import { UserMenu } from '@/src/features/auth/presentation/components/UserMenu';
import { requireSession } from '@/src/lib/dal';

async function Welcome() {
    const { user } = await requireSession();
    return (
        <>
            <h1 className="text-3xl font-semibold tracking-tight">Hola, {user.fullName ?? user.username}</h1>
            <p className="text-zinc-600 dark:text-zinc-400">Tu sesión está activa.</p>
            <Suspense fallback={null}>
                <CatalogNav />
            </Suspense>
            <Suspense fallback={null}>
                <CommunityNav />
            </Suspense>
            <Suspense fallback={null}>
                <AdminNav />
            </Suspense>
            <UserMenu />
        </>
    );
}

export default function Home() {
    return (
        <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <Suspense fallback={null}>
                <Welcome />
            </Suspense>
        </main>
    );
}
