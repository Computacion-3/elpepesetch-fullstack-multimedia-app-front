import { assertValidMediaApproval } from '../entities/media-item';
import type { MediaApprovalDraft, MediaItem } from '../entities/media-item';
import type { MediaRepository } from '../repositories/media.repository';

/** Comprueba el motivo de rechazo antes de ejecutar una decisión de moderación. */
export class SetMediaItemApprovalUseCase {
    constructor(private readonly repository: MediaRepository) {}

    async execute(accessToken: string, id: string, draft: MediaApprovalDraft): Promise<MediaItem> {
        assertValidMediaApproval(draft);
        return this.repository.setApproval(accessToken, id, draft);
    }
}
