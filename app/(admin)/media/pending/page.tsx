import { Suspense } from 'react';
import { requirePermission } from '@/src/lib/dal';
import { PERMISSIONS } from '@/src/shared/permissions';
import { MediaApprovalScreen } from '@/src/features/media/presentation/components/MediaApprovalScreen';

async function PendingMediaContent() {
    await requirePermission(PERMISSIONS.CATALOG_MODERATE);
    return <MediaApprovalScreen />;
}

/** La autorización inicial mejora la navegación; las Server Actions vuelven a validarla. */
export default function PendingMediaPage() {
    return (
        <Suspense fallback={<p role="status">Cargando propuestas…</p>}>
            <PendingMediaContent />
        </Suspense>
    );
}
