import type { Genre } from '../entities/genre';
import type { GenresRepository } from '../repositories/genres.repository';

/** Recupera los géneros que pueden usarse en filtros y formularios. */
export class ListGenresUseCase {
    constructor(private readonly repository: GenresRepository) {}

    async execute(accessToken: string): Promise<Genre[]> {
        return this.repository.list(accessToken);
    }
}
