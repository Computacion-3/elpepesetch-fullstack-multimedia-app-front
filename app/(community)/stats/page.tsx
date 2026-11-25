import { Suspense } from 'react';
import { StatsDashboard } from '@/src/features/stats/presentation/components/StatsDashboard';
import { requireSession } from '@/src/lib/dal';
import { PERMISSIONS } from '@/src/shared/permissions';

/**
 * Contenido protegido en servidor para `/stats`.
 * Todos los usuarios autenticados ven sus estadísticas personales; la sección global
 * se habilita únicamente cuando el usuario posee `stats:read_global`.
 */
async function StatsContent() {
    const { user } = await requireSession();
    return <StatsDashboard canReadGlobal={user.hasPermission(PERMISSIONS.STATS_GLOBAL_READ)} />;
}

/** Ruta `/stats`: tablero de estadísticas personales y globales. */
export default function StatsPage() {
    return (
        <Suspense fallback={null}>
            <StatsContent />
        </Suspense>
    );
}
