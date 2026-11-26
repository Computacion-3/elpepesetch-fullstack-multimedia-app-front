import { Suspense } from 'react';
import { requireSession } from '@/src/lib/dal';
import { PERMISSIONS } from '@/src/shared/permissions';
import { MediaDetailScreen } from '@/src/features/media/presentation/components/MediaDetailScreen';
import { Spinner } from '@/src/shared/ui/Spinner';

type MediaDetailPageProps = { params: Promise<{ id: string }> };

/** Los parámetros dinámicos son asíncronos en Next 16 y se resuelven durante el stream. */
async function MediaDetailContent({ params }: MediaDetailPageProps) {
    const [{ id }, session] = await Promise.all([params, requireSession()]);
    return (
        <MediaDetailScreen
            id={id}
            canEditProposal={session.user.hasPermission(PERMISSIONS.CATALOG_UPDATE)}
        />
    );
}

export default function MediaDetailPage(props: MediaDetailPageProps) {
    return (
        <main className="mx-auto w-full max-w-6xl flex-1 p-6">
            <Suspense fallback={<Spinner label="Cargando detalle" size="lg" className="py-16" />}>
                <MediaDetailContent {...props} />
            </Suspense>
        </main>
    );
}
