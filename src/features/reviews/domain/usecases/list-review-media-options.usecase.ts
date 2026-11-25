import type { ReviewMediaOption } from '../entities/review';
import type { ReviewsRepository } from '../repositories/reviews.repository';

/**
 * Caso de uso para obtener los elementos multimedia disponibles sobre los que se puede reseñar.
 */
export class ListReviewMediaOptionsUseCase {
    constructor(private readonly repository: ReviewsRepository) {}

    execute(token: string): Promise<ReviewMediaOption[]> {
        return this.repository.listMediaOptions(token);
    }
}
