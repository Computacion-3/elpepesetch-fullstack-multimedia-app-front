import { assertValidMediaChanges } from '../entities/media-item';
import type { MediaItem, MediaItemChanges } from '../entities/media-item';
import type { MediaRepository } from '../repositories/media.repository';

/** Valida los campos modificados; servidor y backend deciden quién puede editar. */
export class UpdateMediaItemUseCase {
    constructor(private readonly repository: MediaRepository) {}

    async execute(accessToken: string, id: string, changes: MediaItemChanges): Promise<MediaItem> {
        assertValidMediaChanges(changes);
        return this.repository.update(accessToken, id, changes);
    }
}
