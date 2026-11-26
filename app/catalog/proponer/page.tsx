import { Suspense } from 'react';
import { requirePermission } from '@/src/lib/dal';
import { PERMISSIONS } from '@/src/shared/permissions';
import { MediaProposalForm } from '@/src/features/media/presentation/components/MediaProposalForm';
import { Spinner } from '@/src/shared/ui/Spinner';

type ProposalPageProps = { searchParams: Promise<{ id?: string | string[] }> };

/** Editar requiere catalog:update; crear una propuesta requiere catalog:create. */
async function ProposalContent({ searchParams }: ProposalPageProps) {
    const params = await searchParams;
    const mediaId = Array.isArray(params.id) ? params.id[0] : params.id;
    const permission = mediaId ? PERMISSIONS.CATALOG_UPDATE : PERMISSIONS.CATALOG_CREATE;
    await requirePermission(permission);
    return <MediaProposalForm mediaId={mediaId} />;
}

export default function ProposalPage(props: ProposalPageProps) {
    return (
        <main className="mx-auto w-full max-w-4xl flex-1 p-6">
            <Suspense fallback={<Spinner label="Cargando formulario" size="lg" className="py-16" />}>
                <ProposalContent {...props} />
            </Suspense>
        </main>
    );
}
