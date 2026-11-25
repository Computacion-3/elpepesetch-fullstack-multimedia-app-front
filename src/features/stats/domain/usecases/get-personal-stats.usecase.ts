import type { PersonalStats } from '../entities/stats';
import type { StatsRepository } from '../repositories/stats.repository';

/**
 * Caso de uso para consultar las estadísticas personales del usuario autenticado.
 */
export class GetPersonalStatsUseCase {
    constructor(private readonly repository: StatsRepository) {}

    execute(token: string): Promise<PersonalStats> {
        return this.repository.getPersonalStats(token);
    }
}
