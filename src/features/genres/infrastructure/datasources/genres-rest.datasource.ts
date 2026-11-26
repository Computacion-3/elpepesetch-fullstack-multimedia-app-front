import { HttpError, type HttpClient } from '@/src/shared/infrastructure/http-client';
import type { CreateGenreDto, GenreDto, UpdateGenreDto } from '../dtos/genre.dto';
import type { GenresDatasource } from './genres.datasource';

/**
 * Transporte REST alineado con `/genres` y con fallback automático a `/genre`
 * cuando el backend expone el controlador base.
 */
export class GenresRestDatasource implements GenresDatasource {
    constructor(private readonly http: HttpClient) {}

    async fetchAll(token: string): Promise<GenreDto[]> {
        return this.withFallback(
            () => this.http.get<GenreDto[]>('/genres', token),
            () => this.http.get<GenreDto[]>('/genre', token),
        );
    }

    async create(token: string, body: CreateGenreDto): Promise<GenreDto> {
        return this.withFallback(
            () => this.http.post<GenreDto>('/genres', body, token),
            () => this.http.post<GenreDto>('/genre', body, token),
        );
    }

    async update(token: string, id: string, body: UpdateGenreDto): Promise<GenreDto> {
        const encoded = encodeURIComponent(id);
        return this.withFallback(
            () => this.http.patch<GenreDto>(`/genres/${encoded}`, body, token),
            () => this.http.patch<GenreDto>(`/genre/${encoded}`, body, token),
        );
    }

    async delete(token: string, id: string): Promise<void> {
        const encoded = encodeURIComponent(id);
        await this.withFallback(
            () => this.http.delete<unknown>(`/genres/${encoded}`, token),
            () => this.http.delete<unknown>(`/genre/${encoded}`, token),
        );
    }

    private async withFallback<T>(primary: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
        try {
            return await primary();
        } catch (err) {
            if (err instanceof HttpError && err.status === 404) {
                return fallback();
            }
            throw err;
        }
    }
}
