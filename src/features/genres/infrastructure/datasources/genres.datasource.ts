import type { CreateGenreDto, GenreDto, UpdateGenreDto } from '../dtos/genre.dto';

/** Puerto de transporte de la consulta y administración de géneros. */
export interface GenresDatasource {
    fetchAll(token: string): Promise<GenreDto[]>;
    create(token: string, body: CreateGenreDto): Promise<GenreDto>;
    update(token: string, id: string, body: UpdateGenreDto): Promise<GenreDto>;
    delete(token: string, id: string): Promise<void>;
}
