import { Suspense } from 'react';
import { ReviewsPanel } from '@/src/features/reviews/presentation/components/ReviewsPanel';
import { requireSession } from '@/src/lib/dal';
import { PERMISSIONS } from '@/src/shared/permissions';

type ReviewsPageProps = {
    searchParams: Promise<{ mediaItemId?: string | string[] }>;
};

/**
 * Contenido protegido en servidor para `/reviews`.
 * Verifica la sesión JWT, extrae los permisos del usuario e inyecta `?mediaItemId=` si viene en la URL.
 */
async function ReviewsContent({ searchParams }: ReviewsPageProps) {
    const { user } = await requireSession();
    const resolved = await searchParams;
    const rawMediaItemId = resolved.mediaItemId;
    const initialMediaItemId = Array.isArray(rawMediaItemId) ? rawMediaItemId[0] : rawMediaItemId;

    return (
        <ReviewsPanel
            currentUserId={user.id}
            currentUserRole={user.role}
            canCreate={user.hasPermission(PERMISSIONS.REVIEWS_CREATE)}
            canUpdate={user.hasPermission(PERMISSIONS.REVIEWS_UPDATE)}
            canDelete={user.hasPermission(PERMISSIONS.REVIEWS_DELETE)}
            canReport={user.hasPermission(PERMISSIONS.REPORTS_CREATE)}
            initialMediaItemId={initialMediaItemId}
        />
    );
}

/** Ruta `/reviews`: reseñas de la comunidad por elemento multimedia. */
export default function ReviewsPage({ searchParams }: ReviewsPageProps) {
    return (
        <Suspense fallback={null}>
            <ReviewsContent searchParams={searchParams} />
        </Suspense>
    );
}
