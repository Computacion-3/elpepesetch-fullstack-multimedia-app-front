import { toDomainError } from '@/src/shared/infrastructure/error-translator';
import type { Genre, GenreChanges, GenreDraft } from '../../domain/entities/genre';
import type { GenresRepository } from '../../domain/repositories/genres.repository';
import type { GenresDatasource } from '../datasources/genres.datasource';
import { GenreMapper } from '../mappers/genre.mapper';

/** Implementa el puerto de géneros y evita que errores del transporte crucen de capa. */
export class GenresRepositoryImpl implements GenresRepository {
    constructor(private readonly datasource: GenresDatasource) {}

    async list(token: string): Promise<Genre[]> {
        try {
            return (await this.datasource.fetchAll(token)).map(GenreMapper.toDomain);
        } catch (error) {
            throw toDomainError(error);
        }
    }

    async create(token: string, draft: GenreDraft): Promise<Genre> {
        try {
            return GenreMapper.toDomain(await this.datasource.create(token, GenreMapper.toCreateDto(draft)));
        } catch (error) {
            throw toDomainError(error);
        }
    }

    async update(token: string, id: string, changes: GenreChanges): Promise<Genre> {
        try {
            return GenreMapper.toDomain(await this.datasource.update(token, id, GenreMapper.toUpdateDto(changes)));
        } catch (error) {
            throw toDomainError(error);
        }
    }

    async remove(token: string, id: string): Promise<void> {
        try {
            await this.datasource.delete(token, id);
        } catch (error) {
            throw toDomainError(error);
        }
    }
}
