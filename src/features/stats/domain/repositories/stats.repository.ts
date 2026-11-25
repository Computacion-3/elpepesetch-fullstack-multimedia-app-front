import type { GlobalStats, PersonalStats } from '../entities/stats';

/**
 * Puerto de repositorio del dominio `stats`.
 * Define las consultas de estadísticas personales y globales sin acoplarse a REST ni HTTP.
 */
export interface StatsRepository {
    /** Obtiene las estadísticas personales de la cuenta asociada al token JWT. */
    getPersonalStats(token: string): Promise<PersonalStats>;

    /** Obtiene las estadísticas globales de la plataforma (requiere `stats:read_global`). */
    getGlobalStats(token: string): Promise<GlobalStats>;
}
