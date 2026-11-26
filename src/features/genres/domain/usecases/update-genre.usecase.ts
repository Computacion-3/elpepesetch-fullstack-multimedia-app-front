import { assertValidGenreChanges } from '../entities/genre';
import type { Genre, GenreChanges } from '../entities/genre';
import type { GenresRepository } from '../repositories/genres.repository';

/** Valida solo los campos modificados y delega la actualización. */
export class UpdateGenreUseCase {
    constructor(private readonly repository: GenresRepository) {}

    async execute(accessToken: string, id: string, changes: GenreChanges): Promise<Genre> {
        assertValidGenreChanges(changes);
        return this.repository.update(accessToken, id, changes);
    }
}
