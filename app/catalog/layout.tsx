import type { ReactNode } from 'react';
import AppHeader from '@/app/app-header';

export default function CatalogLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-full flex-col">
            <AppHeader />
            {children}
        </div>
    );
}
