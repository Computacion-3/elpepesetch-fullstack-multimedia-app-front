import type { CreateReviewDraft, Review, ReviewPage, ReviewQuery } from '../entities/review';

/** Puerto para las reseñas de un elemento multimedia. */
export interface ReviewsRepository {
  listByMedia(mediaItemId: string, query: ReviewQuery): Promise<ReviewPage>;
  create(mediaItemId: string, draft: CreateReviewDraft): Promise<Review>;
}
