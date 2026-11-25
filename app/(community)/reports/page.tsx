import { Suspense } from 'react';
import { ReportsModerationPanel } from '@/src/features/reports/presentation/components/ReportsModerationPanel';
import { requirePermission } from '@/src/lib/dal';
import { PERMISSIONS } from '@/src/shared/permissions';

/**
 * Contenido protegido en servidor para `/reports`.
 * Exige el permiso `reviews:moderate` (renderiza `forbidden()` si el usuario no lo posee).
 */
async function ReportsContent() {
    await requirePermission(PERMISSIONS.REVIEWS_MODERATE);
    return <ReportsModerationPanel />;
}

/** Ruta `/reports`: bandeja de moderación de reseñas reportadas. */
export default function ReportsPage() {
    return (
        <Suspense fallback={null}>
            <ReportsContent />
        </Suspense>
    );
}
