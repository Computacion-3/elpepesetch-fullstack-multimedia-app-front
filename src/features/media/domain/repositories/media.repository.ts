import type { Page } from '@/src/shared/domain/page';
import type { MediaApprovalDraft, MediaItem, MediaItemChanges, MediaItemDraft, MediaQuery } from '../entities/media-item';

/** Puerto del catálogo; las capas externas implementan estas operaciones. */
export interface MediaRepository {
    list(accessToken: string, query: MediaQuery): Promise<Page<MediaItem>>;
    listPending(accessToken: string, query: MediaQuery): Promise<Page<MediaItem>>;
    getById(accessToken: string, id: string): Promise<MediaItem>;
    create(accessToken: string, draft: MediaItemDraft): Promise<MediaItem>;
    update(accessToken: string, id: string, changes: MediaItemChanges): Promise<MediaItem>;
    setApproval(accessToken: string, id: string, draft: MediaApprovalDraft): Promise<MediaItem>;
}
