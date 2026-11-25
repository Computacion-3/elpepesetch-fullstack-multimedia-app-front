import type { Page } from '@/src/shared/domain/page';
import type { MediaItem, MediaQuery } from '../entities/media-item';
import type { MediaRepository } from '../repositories/media.repository';

/** Consulta el catálogo visible para el usuario junto con sus filtros y página. */
export class ListMediaUseCase {
    constructor(private readonly repository: MediaRepository) {}

    async execute(accessToken: string, query: MediaQuery): Promise<Page<MediaItem>> {
        return this.repository.list(accessToken, query);
    }
}
