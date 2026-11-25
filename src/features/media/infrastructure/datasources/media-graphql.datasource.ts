import type { GraphQLClient } from '@/src/shared/infrastructure/graphql-client';
import type {
    CreateMediaItemDto,
    MediaApprovalDto,
    MediaItemDto,
    MediaQueryDto,
    PaginatedMediaDto,
    UpdateMediaItemDto,
} from '../dtos/media.dto';
import type { MediaDatasource } from './media.datasource';

// Contrato provisional de frontend; el backend debe agregar estos campos para habilitar GraphQL.
const MEDIA_FIELDS = `id title type description releaseYear creator coverUrl platform durationMinutes pages isbn approvalStatus rejectionReason averageRating ratingsCount createdAt updatedAt genres { id name description } createdBy { id username }`;
const LIST_MEDIA = `query MediaItems($query: MediaQueryInput!) { mediaItems(query: $query) { data { ${MEDIA_FIELDS} } meta { total page limit totalPages } } }`;
const LIST_PENDING = `query PendingMediaItems($query: MediaQueryInput!) { pendingMediaItems(query: $query) { data { ${MEDIA_FIELDS} } meta { total page limit totalPages } } }`;
const GET_MEDIA = `query MediaItem($id: ID!) { mediaItem(id: $id) { ${MEDIA_FIELDS} } }`;
const CREATE_MEDIA = `mutation CreateMediaItem($input: CreateMediaItemInput!) { createMediaItem(input: $input) { ${MEDIA_FIELDS} } }`;
const UPDATE_MEDIA = `mutation UpdateMediaItem($id: ID!, $input: UpdateMediaItemInput!) { updateMediaItem(id: $id, input: $input) { ${MEDIA_FIELDS} } }`;
const SET_APPROVAL = `mutation SetMediaItemApproval($id: ID!, $input: MediaApprovalInput!) { setMediaItemApproval(id: $id, input: $input) { ${MEDIA_FIELDS} } }`;

/** DataSource GraphQL que implementa el mismo contrato que el transporte REST. */
export class MediaGraphQLDatasource implements MediaDatasource {
    constructor(private readonly graphql: GraphQLClient) {}

    async fetchAll(token: string, query: MediaQueryDto): Promise<PaginatedMediaDto> {
        return (await this.graphql.execute<{ mediaItems: PaginatedMediaDto }>(LIST_MEDIA, { query }, token)).mediaItems;
    }

    async fetchPending(token: string, query: MediaQueryDto): Promise<PaginatedMediaDto> {
        return (await this.graphql.execute<{ pendingMediaItems: PaginatedMediaDto }>(LIST_PENDING, { query }, token)).pendingMediaItems;
    }

    async fetchById(token: string, id: string): Promise<MediaItemDto> {
        return (await this.graphql.execute<{ mediaItem: MediaItemDto }>(GET_MEDIA, { id }, token)).mediaItem;
    }

    async create(token: string, body: CreateMediaItemDto): Promise<MediaItemDto> {
        return (await this.graphql.execute<{ createMediaItem: MediaItemDto }>(CREATE_MEDIA, { input: body }, token)).createMediaItem;
    }

    async update(token: string, id: string, body: UpdateMediaItemDto): Promise<MediaItemDto> {
        return (await this.graphql.execute<{ updateMediaItem: MediaItemDto }>(UPDATE_MEDIA, { id, input: body }, token)).updateMediaItem;
    }

    async setApproval(token: string, id: string, body: MediaApprovalDto): Promise<MediaItemDto> {
        return (await this.graphql.execute<{ setMediaItemApproval: MediaItemDto }>(SET_APPROVAL, { id, input: body }, token)).setMediaItemApproval;
    }
}
