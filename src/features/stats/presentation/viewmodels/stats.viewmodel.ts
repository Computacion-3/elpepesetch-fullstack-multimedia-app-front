import type {
    GlobalStats,
    PersonalStats,
    StatsLibraryStatus,
    StatsMediaType,
} from '../../domain/entities/stats';

const MEDIA_TYPE_LABELS: Record<StatsMediaType, string> = {
    GAME: 'Juegos',
    MOVIE: 'Películas',
    BOOK: 'Libros',
};

const LIBRARY_STATUS_LABELS: Record<StatsLibraryStatus, string> = {
    PENDING: 'Pendientes',
    IN_PROGRESS: 'En progreso',
    COMPLETED: 'Completados',
    DROPPED: 'Abandonados',
};

/** Elemento de distribución (tipo, estado o género) con porcentaje calculado para barra visual. */
export interface StatDistributionItemViewModel {
    key: string;
    label: string;
    count: number;
    percentage: number;
}

/** Punto mensual de actividad de finalizaciones en los últimos 12 meses. */
export interface MonthlyStatViewModel {
    month: string;
    label: string;
    count: number;
    percentage: number;
}

/** ViewModel serializable de las estadísticas personales del usuario. */
export interface PersonalStatsViewModel {
    totalEntries: number;
    recentCompletionsTotal: number;
    averageRatingLabel: string;
    averageRating: number;
    byType: StatDistributionItemViewModel[];
    byStatus: StatDistributionItemViewModel[];
    topGenres: StatDistributionItemViewModel[];
    completedByMonth: MonthlyStatViewModel[];
}

/** ViewModel serializable de las estadísticas globales de la plataforma. */
export interface GlobalStatsViewModel {
    users: number;
    totalMediaItems: number;
    libraryEntries: number;
    reviews: number;
    mediaItemsByType: StatDistributionItemViewModel[];
}

function toPercentage(value: number, max: number): number {
    if (max <= 0 || value <= 0) return 0;
    return Math.round((value / max) * 100);
}

function formatMonthLabel(monthKey: string): string {
    const [yearText, monthText] = monthKey.split('-');
    const year = Number(yearText);
    const month = Number(monthText);
    if (!year || !month) return monthKey;
    const date = new Date(Date.UTC(year, month - 1, 1));
    return new Intl.DateTimeFormat('es-CO', {
        month: 'short',
        year: '2-digit',
        timeZone: 'UTC',
    }).format(date);
}

/**
 * Transformador de entidades de estadísticas a ViewModels con etiquetas localizadas y porcentajes.
 */
export class StatsViewModelMapper {
    static toPersonalViewModel(stats: PersonalStats): PersonalStatsViewModel {
        const totalEntries = stats.getTotalEntries();
        const maxGenreCount = Math.max(0, ...stats.topGenres.map((g) => g.count));
        const maxMonthlyCount = Math.max(0, ...stats.completedByMonth.map((m) => m.count));

        return {
            totalEntries,
            recentCompletionsTotal: stats.getRecentCompletionsTotal(),
            averageRating: stats.averageRating,
            averageRatingLabel:
                stats.averageRating > 0 ? `${stats.averageRating.toFixed(1)} / 10` : 'Sin calificar',
            byType: (['GAME', 'MOVIE', 'BOOK'] as const).map((type) => ({
                key: type,
                label: MEDIA_TYPE_LABELS[type],
                count: stats.entriesByType[type],
                percentage: toPercentage(stats.entriesByType[type], totalEntries),
            })),
            byStatus: (['PENDING', 'IN_PROGRESS', 'COMPLETED', 'DROPPED'] as const).map(
                (status) => ({
                    key: status,
                    label: LIBRARY_STATUS_LABELS[status],
                    count: stats.entriesByStatus[status],
                    percentage: toPercentage(stats.entriesByStatus[status], totalEntries),
                }),
            ),
            topGenres: stats.topGenres.map((genre) => ({
                key: genre.id,
                label: genre.name,
                count: genre.count,
                percentage: toPercentage(genre.count, maxGenreCount),
            })),
            completedByMonth: stats.completedByMonth.map((item) => ({
                month: item.month,
                label: formatMonthLabel(item.month),
                count: item.count,
                percentage: toPercentage(item.count, maxMonthlyCount),
            })),
        };
    }

    static toGlobalViewModel(stats: GlobalStats): GlobalStatsViewModel {
        const totalMediaItems = stats.getTotalMediaItems();
        return {
            users: stats.users,
            totalMediaItems,
            libraryEntries: stats.libraryEntries,
            reviews: stats.reviews,
            mediaItemsByType: (['GAME', 'MOVIE', 'BOOK'] as const).map((type) => ({
                key: type,
                label: MEDIA_TYPE_LABELS[type],
                count: stats.mediaItemsByType[type],
                percentage: toPercentage(stats.mediaItemsByType[type], totalMediaItems),
            })),
        };
    }
}
