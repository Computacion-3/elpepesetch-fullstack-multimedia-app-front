import { Suspense } from 'react';
import Link from 'next/link';
import { UserMenu } from '@/src/features/auth/presentation/components/UserMenu';
import { AdminNav } from './admin-nav';
import { CatalogNav } from './catalog-nav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-full flex-col">
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-300 px-6 py-4">
                <div className="flex flex-wrap items-center gap-6">
                    <Link href="/" className="text-lg font-semibold">Administración</Link>
                    <Suspense fallback={null}>
                        <AdminNav />
                    </Suspense>
                    <Suspense fallback={null}>
                        <CatalogNav />
                    </Suspense>
                </div>
                <UserMenu />
            </header>
            <main className="mx-auto w-full max-w-5xl flex-1 p-6">{children}</main>
        </div>
    );
}
