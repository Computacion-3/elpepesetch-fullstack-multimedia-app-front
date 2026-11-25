import type { HttpClient } from '@/src/shared/infrastructure/http-client';
import type { CreateGenreDto, GenreDto, UpdateGenreDto } from '../dtos/genre.dto';
import type { GenresDatasource } from './genres.datasource';

/** Transporte REST alineado con GET/POST/PATCH/DELETE /genres. */
export class GenresRestDatasource implements GenresDatasource {
    constructor(private readonly http: HttpClient) {}

    fetchAll(token: string): Promise<GenreDto[]> {
        return this.http.get<GenreDto[]>('/genres', token);
    }

    create(token: string, body: CreateGenreDto): Promise<GenreDto> {
        return this.http.post<GenreDto>('/genres', body, token);
    }

    update(token: string, id: string, body: UpdateGenreDto): Promise<GenreDto> {
        return this.http.patch<GenreDto>(`/genres/${encodeURIComponent(id)}`, body, token);
    }

    async delete(token: string, id: string): Promise<void> {
        await this.http.delete<unknown>(`/genres/${encodeURIComponent(id)}`, token);
    }
}
