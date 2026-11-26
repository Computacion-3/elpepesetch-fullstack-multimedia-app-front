import Link from 'next/link';

export default function Forbidden() {
    return (
        <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <h1 className="text-3xl font-semibold tracking-tight">Acceso denegado</h1>
            <p className="text-muted">No tienes permiso para ver esta página.</p>
            <Link
                href="/"
                className="rounded-lg text-sm font-semibold text-brand underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
            >
                Volver al inicio
            </Link>
        </main>
    );
}
