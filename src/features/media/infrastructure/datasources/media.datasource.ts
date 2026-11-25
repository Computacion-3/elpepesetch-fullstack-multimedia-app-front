import type {
    CreateMediaItemDto,
    MediaApprovalDto,
    MediaItemDto,
    MediaQueryDto,
    PaginatedMediaDto,
    UpdateMediaItemDto,
} from '../dtos/media.dto';

/** Puerto de transporte para que REST y GraphQL puedan intercambiarse sin tocar el dominio. */
export interface MediaDatasource {
    fetchAll(token: string, query: MediaQueryDto): Promise<PaginatedMediaDto>;
    fetchPending(token: string, query: MediaQueryDto): Promise<PaginatedMediaDto>;
    fetchById(token: string, id: string): Promise<MediaItemDto>;
    create(token: string, body: CreateMediaItemDto): Promise<MediaItemDto>;
    update(token: string, id: string, body: UpdateMediaItemDto): Promise<MediaItemDto>;
    setApproval(token: string, id: string, body: MediaApprovalDto): Promise<MediaItemDto>;
}
