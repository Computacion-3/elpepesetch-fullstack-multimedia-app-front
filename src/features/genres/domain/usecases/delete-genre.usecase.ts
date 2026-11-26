import type { GenresRepository } from '../repositories/genres.repository';

/** Elimina un género; el backend informa si todavía está asignado a contenido. */
export class DeleteGenreUseCase {
    constructor(private readonly repository: GenresRepository) {}

    async execute(accessToken: string, id: string): Promise<void> {
        return this.repository.remove(accessToken, id);
    }
}
