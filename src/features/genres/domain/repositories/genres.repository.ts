import type { Genre, GenreChanges, GenreDraft } from '../entities/genre';

/** Puerto de lectura y administración de géneros. */
export interface GenresRepository {
    list(accessToken: string): Promise<Genre[]>;
    create(accessToken: string, draft: GenreDraft): Promise<Genre>;
    update(accessToken: string, id: string, changes: GenreChanges): Promise<Genre>;
    remove(accessToken: string, id: string): Promise<void>;
}
