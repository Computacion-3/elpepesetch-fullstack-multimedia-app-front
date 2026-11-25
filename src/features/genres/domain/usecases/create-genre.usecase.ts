import { assertValidGenreDraft } from '../entities/genre';
import type { Genre, GenreDraft } from '../entities/genre';
import type { GenresRepository } from '../repositories/genres.repository';

/** Valida y crea un género mediante el contrato del repositorio. */
export class CreateGenreUseCase {
    constructor(private readonly repository: GenresRepository) {}

    async execute(accessToken: string, draft: GenreDraft): Promise<Genre> {
        assertValidGenreDraft(draft);
        return this.repository.create(accessToken, draft);
    }
}
