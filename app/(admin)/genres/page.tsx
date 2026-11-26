import { Suspense } from 'react';
import { requirePermission } from '@/src/lib/dal';
import { PERMISSIONS } from '@/src/shared/permissions';
import { GenresManagementScreen } from '@/src/features/genres/presentation/components/GenresManagementScreen';
import { Spinner } from '@/src/shared/ui/Spinner';

async function GenresContent() {
    await requirePermission(PERMISSIONS.GENRES_MANAGE);
    return <GenresManagementScreen />;
}

/** La autorización inicial acompaña la comprobación repetida en cada Server Action. */
export default function GenresPage() {
    return (
        <Suspense fallback={<Spinner label="Cargando géneros" size="lg" className="py-16" />}>
            <GenresContent />
        </Suspense>
    );
}
