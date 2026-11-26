import { HttpError, type HttpClient } from '@/src/shared/infrastructure/http-client';
import type {
    CreateMediaItemDto,
    MediaApprovalDto,
    MediaItemDto,
    MediaQueryDto,
    PaginatedMediaDto,
    UpdateMediaItemDto,
} from '../dtos/media.dto';
import type { MediaDatasource } from './media.datasource';

/**
 * Transporte REST alineado con `/media` (Swagger) y con fallback automático a `/media-item`
 * cuando el backend expone la ruta base sin paginación en servidor.
 */
export class MediaRestDatasource implements MediaDatasource {
    constructor(private readonly http: HttpClient) {}

    async fetchAll(token: string, query: MediaQueryDto): Promise<PaginatedMediaDto> {
        try {
            return await this.http.get<PaginatedMediaDto>(`/media?${this.toQueryString(query)}`, token);
        } catch (err) {
            if (err instanceof HttpError && err.status === 404) {
                const items = await this.http.get<MediaItemDto[]>('/media-item', token);
                return this.filterAndPaginate(items, 'APPROVED', query);
            }
            throw err;
        }
    }

    async fetchPending(token: string, query: MediaQueryDto): Promise<PaginatedMediaDto> {
        try {
            return await this.http.get<PaginatedMediaDto>(`/media/pending?${this.toQueryString(query)}`, token);
        } catch (err) {
            if (err instanceof HttpError && err.status === 404) {
                const items = await this.http.get<MediaItemDto[]>('/media-item', token);
                return this.filterAndPaginate(items, 'PENDING', query);
            }
            throw err;
        }
    }

    async fetchById(token: string, id: string): Promise<MediaItemDto> {
        const encoded = encodeURIComponent(id);
        try {
            return await this.http.get<MediaItemDto>(`/media/${encoded}`, token);
        } catch (err) {
            if (err instanceof HttpError && err.status === 404) {
                return this.http.get<MediaItemDto>(`/media-item/${encoded}`, token);
            }
            throw err;
        }
    }

    async create(token: string, body: CreateMediaItemDto): Promise<MediaItemDto> {
        try {
            return await this.http.post<MediaItemDto>('/media', body, token);
        } catch (err) {
            if (err instanceof HttpError && err.status === 404) {
                return this.http.post<MediaItemDto>('/media-item', body, token);
            }
            throw err;
        }
    }

    async update(token: string, id: string, body: UpdateMediaItemDto): Promise<MediaItemDto> {
        const encoded = encodeURIComponent(id);
        try {
            return await this.http.patch<MediaItemDto>(`/media/${encoded}`, body, token);
        } catch (err) {
            if (err instanceof HttpError && err.status === 404) {
                return this.http.patch<MediaItemDto>(`/media-item/${encoded}`, body, token);
            }
            throw err;
        }
    }

    setApproval(token: string, id: string, body: MediaApprovalDto): Promise<MediaItemDto> {
        return this.http.patch<MediaItemDto>(`/media/${encodeURIComponent(id)}/approval`, body, token);
    }

    /** Convierte solo filtros definidos a parámetros HTTP y descarta valores vacíos. */
    private toQueryString(query: MediaQueryDto): string {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(query)) {
            if (value !== undefined && value !== '') params.set(key, String(value));
        }
        return params.toString();
    }

    /** Aplica filtros, ordenamiento y paginación cuando se consume el fallback `/media-item`. */
    private filterAndPaginate(
        items: MediaItemDto[],
        approvalStatus: 'APPROVED' | 'PENDING',
        query: MediaQueryDto,
    ): PaginatedMediaDto {
        const search = query.q?.trim().toLowerCase();
        const filtered = items.filter((item) => {
            if (item.approvalStatus !== approvalStatus) return false;
            if (query.type && item.type !== query.type) return false;
            if (query.year && item.releaseYear !== query.year) return false;
            if (query.genreId && !(item.genres ?? []).some((genre) => genre.id === query.genreId)) {
                return false;
            }
            if (search) {
                const haystack = `${item.title} ${item.creator}`.toLowerCase();
                if (!haystack.includes(search)) return false;
            }
            return true;
        });

        const sortBy = query.sortBy ?? 'title';
        const direction = query.order === 'DESC' ? -1 : 1;
        const sorted = [...filtered].sort((left, right) => {
            if (sortBy === 'releaseYear') {
                return (left.releaseYear - right.releaseYear) * direction;
            }
            if (sortBy === 'averageRating') {
                return (Number(left.averageRating ?? 0) - Number(right.averageRating ?? 0)) * direction;
            }
            return left.title.localeCompare(right.title) * direction;
        });

        const page = Math.max(1, query.page || 1);
        const limit = Math.max(1, query.limit || 12);
        const total = sorted.length;
        const totalPages = Math.max(1, Math.ceil(total / limit));
        const start = (page - 1) * limit;

        return {
            data: sorted.slice(start, start + limit),
            meta: { total, page, limit, totalPages },
        };
    }
}
