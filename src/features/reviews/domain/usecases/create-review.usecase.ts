import { assertValidReviewDraft, type Review, type ReviewDraft } from '../entities/review';
import type { ReviewsRepository } from '../repositories/reviews.repository';

/**
 * Caso de uso para crear una reseña sobre un elemento multimedia.
 * Valida invariantes de dominio (longitud de título y contenido) antes de delegar al repositorio.
 */
export class CreateReviewUseCase {
    constructor(private readonly repository: ReviewsRepository) {}

    execute(token: string, mediaItemId: string, draft: ReviewDraft): Promise<Review> {
        assertValidReviewDraft(mediaItemId, draft);
        return this.repository.create(token, mediaItemId, draft);
    }
}
