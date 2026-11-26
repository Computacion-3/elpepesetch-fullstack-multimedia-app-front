import { GlobalStats, PersonalStats } from '../../domain/entities/stats';
import type { GlobalStatsDto, PersonalStatsDto } from '../dtos/stats.dto';

/**
 * Traductor entre los DTOs de estadísticas del backend y las entidades puras de dominio.
 */
export class StatsMapper {
    static toPersonalDomain(dto: PersonalStatsDto): PersonalStats {
        return new PersonalStats(
            {
                GAME: dto.entriesByType?.GAME ?? 0,
                MOVIE: dto.entriesByType?.MOVIE ?? 0,
                BOOK: dto.entriesByType?.BOOK ?? 0,
            },
            {
                PENDING: dto.entriesByStatus?.PENDING ?? 0,
                IN_PROGRESS: dto.entriesByStatus?.IN_PROGRESS ?? 0,
                COMPLETED: dto.entriesByStatus?.COMPLETED ?? 0,
                DROPPED: dto.entriesByStatus?.DROPPED ?? 0,
            },
            dto.topGenres ?? [],
            dto.completedByMonth ?? [],
            dto.averageRating ?? 0,
        );
    }

    static toGlobalDomain(dto: GlobalStatsDto): GlobalStats {
        return new GlobalStats(
            dto.users ?? 0,
            {
                GAME: dto.mediaItemsByType?.GAME ?? 0,
                MOVIE: dto.mediaItemsByType?.MOVIE ?? 0,
                BOOK: dto.mediaItemsByType?.BOOK ?? 0,
            },
            dto.libraryEntries ?? 0,
            dto.reviews ?? 0,
        );
    }
}
