import { HttpError, type HttpClient } from '../../../../shared/infrastructure/http-client';
import type {
    CatalogMediaDto,
    CreateReviewRequestDto,
    PaginatedCatalogMediaDto,
    PaginatedReviewsDto,
    ReviewDto,
    UpdateReviewRequestDto,
} from '../dtos/reviews.dto';
import type { ReviewsDatasource } from './reviews.datasource';

/**
 * Implementación REST del datasource de reseñas contra el backend NestJS.
 */
export class ReviewsRestDatasource implements ReviewsDatasource {
    constructor(private readonly http: HttpClient) {}

    /**
     * Consulta `GET /media?limit=50` según Swagger; si el entorno apunta a un backend
     * con la ruta anterior `/media-item` (404), realiza el fallback automáticamente.
     */
    async listMediaOptions(token: string): Promise<CatalogMediaDto[]> {
        try {
            const response = await this.http.get<PaginatedCatalogMediaDto | CatalogMediaDto[]>(
                '/media?limit=50',
                token,
            );
            return Array.isArray(response) ? response : (response.data ?? []);
        } catch (err) {
            if (err instanceof HttpError && err.status === 404) {
                return this.http.get<CatalogMediaDto[]>('/media-item', token);
            }
            throw err;
        }
    }

    listByMediaItem(token: string, mediaItemId: string, query: string): Promise<PaginatedReviewsDto> {
        return this.http.get<PaginatedReviewsDto>(`/media/${mediaItemId}/reviews?${query}`, token);
    }

    create(token: string, mediaItemId: string, body: CreateReviewRequestDto): Promise<ReviewDto> {
        return this.http.post<ReviewDto>(`/media/${mediaItemId}/reviews`, body, token);
    }

    update(token: string, id: string, body: UpdateReviewRequestDto): Promise<ReviewDto> {
        return this.http.patch<ReviewDto>(`/reviews/${id}`, body, token);
    }

    async remove(token: string, id: string): Promise<void> {
        await this.http.delete<unknown>(`/reviews/${id}`, token);
    }
}
