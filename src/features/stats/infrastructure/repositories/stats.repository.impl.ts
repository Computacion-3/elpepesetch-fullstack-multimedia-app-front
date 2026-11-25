import { toDomainError } from '@/src/shared/infrastructure/error-translator';
import type { GlobalStats, PersonalStats } from '../../domain/entities/stats';
import type { StatsRepository } from '../../domain/repositories/stats.repository';
import type { StatsDatasource } from '../datasources/stats.datasource';
import { StatsMapper } from '../mappers/stats.mapper';

/**
 * Implementación concreta de `StatsRepository` que traduce DTOs y errores HTTP.
 */
export class StatsRepositoryImpl implements StatsRepository {
    constructor(private readonly datasource: StatsDatasource) {}

    async getPersonalStats(token: string): Promise<PersonalStats> {
        try {
            const dto = await this.datasource.getPersonal(token);
            return StatsMapper.toPersonalDomain(dto);
        } catch (err) {
            throw toDomainError(err);
        }
    }

    async getGlobalStats(token: string): Promise<GlobalStats> {
        try {
            const dto = await this.datasource.getGlobal(token);
            return StatsMapper.toGlobalDomain(dto);
        } catch (err) {
            throw toDomainError(err);
        }
    }
}
