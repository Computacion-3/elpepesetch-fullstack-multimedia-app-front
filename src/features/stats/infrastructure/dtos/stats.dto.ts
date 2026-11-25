import type { StatsLibraryStatus, StatsMediaType } from '../../domain/entities/stats';

/** DTO devuelto por `GET /stats/me`. */
export interface PersonalStatsDto {
    entriesByType: Record<StatsMediaType, number>;
    entriesByStatus: Record<StatsLibraryStatus, number>;
    topGenres: Array<{ id: string; name: string; count: number }>;
    completedByMonth: Array<{ month: string; count: number }>;
    averageRating: number;
}

/** DTO devuelto por `GET /stats/global`. */
export interface GlobalStatsDto {
    users: number;
    mediaItemsByType: Record<StatsMediaType, number>;
    libraryEntries: number;
    reviews: number;
}
