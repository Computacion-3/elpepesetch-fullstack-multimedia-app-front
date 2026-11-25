import { assertValidReviewChanges, type Review, type ReviewChanges } from '../entities/review';
import type { ReviewsRepository } from '../repositories/reviews.repository';

/**
 * Caso de uso para actualizar una reseña propia (o cualquiera si el usuario es administrador).
 */
export class UpdateReviewUseCase {
    constructor(private readonly repository: ReviewsRepository) {}

    execute(token: string, id: string, changes: ReviewChanges): Promise<Review> {
        assertValidReviewChanges(changes);
        return this.repository.update(token, id, changes);
    }
}
