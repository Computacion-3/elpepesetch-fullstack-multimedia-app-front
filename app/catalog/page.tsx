import { Suspense } from 'react';
import { requireSession } from '@/src/lib/dal';
import { MediaCatalogScreen } from '@/src/features/media/presentation/components/MediaCatalogScreen';

/** La lectura de sesión es dinámica en Next 16 y queda dentro del límite Suspense. */
async function CatalogContent() {
    await requireSession();
    return <MediaCatalogScreen />;
}

export default function CatalogPage() {
    return (
        <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 p-6">
            <Suspense fallback={<p role="status">Cargando catálogo…</p>}>
                <CatalogContent />
            </Suspense>
        </main>
    );
}
