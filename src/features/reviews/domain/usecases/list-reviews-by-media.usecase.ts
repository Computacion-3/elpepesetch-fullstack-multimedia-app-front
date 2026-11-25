import { ValidationError } from '@/src/shared/domain/errors';
import type { ReviewPage, ReviewQuery } from '../entities/review';
import type { ReviewsRepository } from '../repositories/reviews.repository';

/** Valida los límites antes de consultar la página de reseñas. */
export class ListReviewsByMediaUseCase {
  constructor(private readonly repository: ReviewsRepository) {}

  execute(mediaItemId: string, query: ReviewQuery): Promise<ReviewPage> {
    if (!Number.isInteger(query.page) || query.page < 1) throw new ValidationError('La página debe ser positiva.');
    if (!Number.isInteger(query.limit) || query.limit < 1 || query.limit > 50) throw new ValidationError('El límite debe estar entre 1 y 50.');
    return this.repository.listByMedia(mediaItemId, query);
  }
}
