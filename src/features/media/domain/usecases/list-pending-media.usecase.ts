import type { Page } from '@/src/shared/domain/page';
import type { MediaItem, MediaQuery } from '../entities/media-item';
import type { MediaRepository } from '../repositories/media.repository';

/** Consulta la cola pendiente que el servidor autoriza a moderadores. */
export class ListPendingMediaUseCase {
    constructor(private readonly repository: MediaRepository) {}

    async execute(accessToken: string, query: MediaQuery): Promise<Page<MediaItem>> {
        return this.repository.listPending(accessToken, query);
    }
}
