import { ValidationError } from '@/src/shared/domain/errors';
import type { CreateReviewDraft, Review } from '../entities/review';
import type { ReviewsRepository } from '../repositories/reviews.repository';

/** Valida los campos visibles y deja al servidor validar la propiedad y elegibilidad. */
export class CreateReviewUseCase {
  constructor(private readonly repository: ReviewsRepository) {}

  execute(mediaItemId: string, draft: CreateReviewDraft): Promise<Review> {
    const content = draft.content.trim();
    const title = draft.title?.trim();
    if (content.length < 10 || content.length > 2000) throw new ValidationError('La reseña debe tener entre 10 y 2000 caracteres.');
    if (title && title.length > 100) throw new ValidationError('El título admite hasta 100 caracteres.');
    return this.repository.create(mediaItemId, { content, ...(title ? { title } : {}) });
  }
}
