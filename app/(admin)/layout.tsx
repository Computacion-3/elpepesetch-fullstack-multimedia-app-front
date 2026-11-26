import AppHeader from '@/app/app-header';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-full flex-col">
            <AppHeader />
            <main className="mx-auto w-full max-w-5xl flex-1 p-6">{children}</main>
        </div>
    );
}
