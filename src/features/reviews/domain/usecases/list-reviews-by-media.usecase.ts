import type { Page } from '@/src/shared/domain/page';
import { ValidationError } from '@/src/shared/domain/errors';
import type { Review, ReviewListQuery } from '../entities/review';
import type { ReviewsRepository } from '../repositories/reviews.repository';

/**
 * Caso de uso para consultar las reseñas paginadas de un elemento multimedia.
 * El backend filtra automáticamente las reseñas ocultas salvo para el autor y moderadores.
 */
export class ListReviewsByMediaUseCase {
    constructor(private readonly repository: ReviewsRepository) {}

    execute(token: string, query: ReviewListQuery): Promise<Page<Review>> {
        if (!query.mediaItemId.trim()) {
            throw new ValidationError('Selecciona un elemento multimedia para consultar sus reseñas');
        }
        return this.repository.listByMediaItem(token, query);
    }
}
