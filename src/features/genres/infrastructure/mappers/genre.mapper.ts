import { Genre } from '../../domain/entities/genre';
import type { GenreChanges, GenreDraft } from '../../domain/entities/genre';
import type { CreateGenreDto, GenreDto, UpdateGenreDto } from '../dtos/genre.dto';

/** Convierte géneros y propuestas entre contratos del dominio y del transporte. */
export class GenreMapper {
    static toDomain(dto: GenreDto): Genre {
        return new Genre(dto.id, dto.name, dto.description ?? null);
    }

    static toCreateDto(draft: GenreDraft): CreateGenreDto {
        const description = draft.description?.trim();
        return {
            name: draft.name.trim(),
            ...(description ? { description } : {}),
        };
    }

    static toUpdateDto(changes: GenreChanges): UpdateGenreDto {
        return {
            ...(changes.name !== undefined ? { name: changes.name.trim() } : {}),
            ...(changes.description !== undefined ? { description: changes.description.trim() } : {}),
        };
    }
}
