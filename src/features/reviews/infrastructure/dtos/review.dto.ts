import type { Review } from '../../domain/entities/review';

/** DTO que devuelve REST para una reseña con su autor. */
export type ReviewDto = Review;

export interface ReviewPageDto {
  data: ReviewDto[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface CreateReviewDto {
  title?: string;
  content: string;
}
