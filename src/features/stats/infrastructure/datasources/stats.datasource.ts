import type { GlobalStatsDto, PersonalStatsDto } from '../dtos/stats.dto';

/**
 * Contrato de fuente de datos para el módulo `stats`.
 */
export interface StatsDatasource {
    /** Consulta `GET /stats/me` con el token de sesión del usuario. */
    getPersonal(token: string): Promise<PersonalStatsDto>;

    /** Consulta `GET /stats/global` con el token de un administrador. */
    getGlobal(token: string): Promise<GlobalStatsDto>;
}
