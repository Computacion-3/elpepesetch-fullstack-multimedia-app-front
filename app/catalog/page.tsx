import { Suspense } from 'react';
import { requireSession } from '@/src/lib/dal';
import { MediaCatalogScreen } from '@/src/features/media/presentation/components/MediaCatalogScreen';
import { Spinner } from '@/src/shared/ui/Spinner';

/** La lectura de sesión es dinámica en Next 16 y queda dentro del límite Suspense. */
async function CatalogContent() {
    await requireSession();
    return <MediaCatalogScreen />;
}

export default function CatalogPage() {
    return (
        <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 p-6">
            <Suspense fallback={<Spinner label="Cargando catálogo" size="lg" className="py-16" />}>
                <CatalogContent />
            </Suspense>
        </main>
    );
}
