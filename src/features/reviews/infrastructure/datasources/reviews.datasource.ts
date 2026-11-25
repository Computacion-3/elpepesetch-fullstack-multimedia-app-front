import type { CreateReviewDraft, ReviewQuery } from '../../domain/entities/review';
import type { ReviewDto, ReviewPageDto } from '../dtos/review.dto';

/** Contrato HTTP para listar y crear reseñas. */
export interface ReviewsDatasource {
  fetchByMedia(mediaItemId: string, query: ReviewQuery): Promise<ReviewPageDto>;
  create(mediaItemId: string, draft: CreateReviewDraft): Promise<ReviewDto>;
}
