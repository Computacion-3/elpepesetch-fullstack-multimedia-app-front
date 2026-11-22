import Link from 'next/link';

export default function Forbidden() {
    return (
        <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <h1 className="text-3xl font-semibold tracking-tight">Acceso denegado</h1>
            <p className="text-zinc-600 dark:text-zinc-400">No tienes permiso para ver esta página.</p>
            <Link href="/" className="font-medium underline">
                Volver al inicio
            </Link>
        </main>
    );
}
