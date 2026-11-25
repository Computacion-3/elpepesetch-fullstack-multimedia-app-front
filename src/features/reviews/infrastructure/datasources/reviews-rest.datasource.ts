import type { HttpClient } from '@/src/shared/infrastructure/http-client';
import type { CreateReviewDraft, ReviewQuery } from '../../domain/entities/review';
import type { ReviewDto, ReviewPageDto } from '../dtos/review.dto';
import type { ReviewsDatasource } from './reviews.datasource';

/** Accede a los endpoints protegidos de reseñas con el token de sesión. */
export class ReviewsRestDatasource implements ReviewsDatasource {
  constructor(private readonly http: HttpClient, private readonly token: string) {}

  fetchByMedia(mediaItemId: string, query: ReviewQuery): Promise<ReviewPageDto> {
    const params = new URLSearchParams({ page: String(query.page), limit: String(query.limit) });
    return this.http.get(`/media/${encodeURIComponent(mediaItemId)}/reviews?${params}`, this.token);
  }

  create(mediaItemId: string, draft: CreateReviewDraft): Promise<ReviewDto> {
    return this.http.post(`/media/${encodeURIComponent(mediaItemId)}/reviews`, draft, this.token);
  }
}
