import type { HttpClient } from '@/src/shared/infrastructure/http-client';
import type { GlobalStatsDto, PersonalStatsDto } from '../dtos/stats.dto';
import type { StatsDatasource } from './stats.datasource';

/**
 * Implementación REST del datasource de estadísticas contra el backend NestJS.
 */
export class StatsRestDatasource implements StatsDatasource {
    constructor(private readonly http: HttpClient) {}

    getPersonal(token: string): Promise<PersonalStatsDto> {
        return this.http.get<PersonalStatsDto>('/stats/me', token);
    }

    getGlobal(token: string): Promise<GlobalStatsDto> {
        return this.http.get<GlobalStatsDto>('/stats/global', token);
    }
}
