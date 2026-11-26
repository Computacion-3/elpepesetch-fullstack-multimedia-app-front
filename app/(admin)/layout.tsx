import AppShell from '@/app/app-shell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AppShell>
            <main className="mx-auto w-full max-w-5xl flex-1 p-6">{children}</main>
        </AppShell>
    );
}
