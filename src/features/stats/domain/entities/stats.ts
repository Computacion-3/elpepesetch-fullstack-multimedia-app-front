/** Tipos de elementos multimedia contabilizados en estadísticas. */
export type StatsMediaType = 'GAME' | 'MOVIE' | 'BOOK';

/** Estados posibles de una entrada en biblioteca personal. */
export type StatsLibraryStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DROPPED';

/** Conteo de entradas por género favorito del usuario. */
export interface GenreStat {
    readonly id: string;
    readonly name: string;
    readonly count: number;
}

/** Conteo de elementos completados durante un mes (`YYYY-MM`). */
export interface MonthlyCompletionStat {
    readonly month: string;
    readonly count: number;
}

/**
 * Entidad de dominio con las estadísticas personales de colección del usuario autenticado.
 */
export class PersonalStats {
    constructor(
        readonly entriesByType: Readonly<Record<StatsMediaType, number>>,
        readonly entriesByStatus: Readonly<Record<StatsLibraryStatus, number>>,
        readonly topGenres: readonly GenreStat[],
        readonly completedByMonth: readonly MonthlyCompletionStat[],
        readonly averageRating: number,
    ) {}

    /** Calcula el total de elementos en la biblioteca personal sumando los tipos. */
    getTotalEntries(): number {
        return (
            this.entriesByType.GAME +
            this.entriesByType.MOVIE +
            this.entriesByType.BOOK
        );
    }

    /** Calcula el total de finalizaciones registradas en los últimos 12 meses. */
    getRecentCompletionsTotal(): number {
        return this.completedByMonth.reduce((sum, item) => sum + item.count, 0);
    }
}

/**
 * Entidad de dominio con los indicadores globales de toda la plataforma (solo administrador).
 */
export class GlobalStats {
    constructor(
        readonly users: number,
        readonly mediaItemsByType: Readonly<Record<StatsMediaType, number>>,
        readonly libraryEntries: number,
        readonly reviews: number,
    ) {}

    /** Calcula el total de títulos del catálogo multimedia sumando juegos, películas y libros. */
    getTotalMediaItems(): number {
        return (
            this.mediaItemsByType.GAME +
            this.mediaItemsByType.MOVIE +
            this.mediaItemsByType.BOOK
        );
    }
}
