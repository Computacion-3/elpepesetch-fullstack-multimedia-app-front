import 'server-only';
import { createFetchHttpClient } from '@/src/shared/infrastructure/http-client';
import { GetGlobalStatsUseCase } from '../domain/usecases/get-global-stats.usecase';
import { GetPersonalStatsUseCase } from '../domain/usecases/get-personal-stats.usecase';
import { StatsRestDatasource } from '../infrastructure/datasources/stats-rest.datasource';
import { StatsRepositoryImpl } from '../infrastructure/repositories/stats.repository.impl';

/**
 * Raíz de composición (DI Container) del módulo `stats`.
 */
export function createStatsContainer() {
    const http = createFetchHttpClient();
    const repository = new StatsRepositoryImpl(new StatsRestDatasource(http));

    return {
        getPersonal: new GetPersonalStatsUseCase(repository),
        getGlobal: new GetGlobalStatsUseCase(repository),
    };
}

export const statsContainer = createStatsContainer();

export type StatsContainer = ReturnType<typeof createStatsContainer>;
