import { assertValidMediaDraft } from '../entities/media-item';
import type { MediaItem, MediaItemDraft } from '../entities/media-item';
import type { MediaRepository } from '../repositories/media.repository';

/** Valida una propuesta antes de delegar su creación al repositorio. */
export class CreateMediaItemUseCase {
    constructor(private readonly repository: MediaRepository) {}

    async execute(accessToken: string, draft: MediaItemDraft): Promise<MediaItem> {
        assertValidMediaDraft(draft);
        return this.repository.create(accessToken, draft);
    }
}
