import type { ReviewsRepository } from '../repositories/reviews.repository';

/**
 * Caso de uso para eliminar una reseña propia (o cualquiera si el usuario es administrador).
 */
export class DeleteReviewUseCase {
    constructor(private readonly repository: ReviewsRepository) {}

    execute(token: string, id: string): Promise<void> {
        return this.repository.remove(token, id);
    }
}
