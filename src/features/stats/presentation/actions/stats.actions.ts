'use server';

import { runAuthenticated, runAuthorized } from '@/src/lib/run-authorized';
import type { ActionResult } from '@/src/shared/domain/action-result';
import { PERMISSIONS } from '@/src/shared/permissions';
import { statsContainer } from '../../di/stats.container';
import {
    StatsViewModelMapper,
    type GlobalStatsViewModel,
    type PersonalStatsViewModel,
} from '../viewmodels/stats.viewmodel';

/** Obtiene las estadísticas personales del usuario autenticado (`GET /stats/me`). */
export async function getPersonalStatsAction(): Promise<ActionResult<PersonalStatsViewModel>> {
    return runAuthenticated('No se pudieron cargar tus estadísticas personales', async (token) =>
        StatsViewModelMapper.toPersonalViewModel(await statsContainer.getPersonal.execute(token)),
    );
}

/** Obtiene las estadísticas globales de la plataforma verificando `stats:read_global`. */
export async function getGlobalStatsAction(): Promise<ActionResult<GlobalStatsViewModel>> {
    return runAuthorized(
        PERMISSIONS.STATS_GLOBAL_READ,
        'No se pudieron cargar las estadísticas globales',
        async (token) =>
            StatsViewModelMapper.toGlobalViewModel(await statsContainer.getGlobal.execute(token)),
    );
}
