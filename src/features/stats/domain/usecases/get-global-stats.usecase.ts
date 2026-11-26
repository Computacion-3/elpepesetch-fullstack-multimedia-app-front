import type { GlobalStats } from '../entities/stats';
import type { StatsRepository } from '../repositories/stats.repository';

/**
 * Caso de uso para consultar las estadísticas globales de la plataforma (solo administradores).
 */
export class GetGlobalStatsUseCase {
    constructor(private readonly repository: StatsRepository) {}

    execute(token: string): Promise<GlobalStats> {
        return this.repository.getGlobalStats(token);
    }
}
