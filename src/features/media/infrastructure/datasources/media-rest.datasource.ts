import type { HttpClient } from '@/src/shared/infrastructure/http-client';
import type {
    CreateMediaItemDto,
    MediaApprovalDto,
    MediaItemDto,
    MediaQueryDto,
    PaginatedMediaDto,
    UpdateMediaItemDto,
} from '../dtos/media.dto';
import type { MediaDatasource } from './media.datasource';

/** Transporte REST alineado con las rutas documentadas en docs/swagger.json. */
export class MediaRestDatasource implements MediaDatasource {
    constructor(private readonly http: HttpClient) {}

    fetchAll(token: string, query: MediaQueryDto): Promise<PaginatedMediaDto> {
        return this.http.get<PaginatedMediaDto>(`/media?${this.toQueryString(query)}`, token);
    }

    fetchPending(token: string, query: MediaQueryDto): Promise<PaginatedMediaDto> {
        return this.http.get<PaginatedMediaDto>(`/media/pending?${this.toQueryString(query)}`, token);
    }

    fetchById(token: string, id: string): Promise<MediaItemDto> {
        return this.http.get<MediaItemDto>(`/media/${encodeURIComponent(id)}`, token);
    }

    create(token: string, body: CreateMediaItemDto): Promise<MediaItemDto> {
        return this.http.post<MediaItemDto>('/media', body, token);
    }

    update(token: string, id: string, body: UpdateMediaItemDto): Promise<MediaItemDto> {
        return this.http.patch<MediaItemDto>(`/media/${encodeURIComponent(id)}`, body, token);
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
}
