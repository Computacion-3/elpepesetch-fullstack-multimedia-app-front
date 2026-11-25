import 'server-only';
import { createFetchHttpClient } from '@/src/shared/infrastructure/http-client';
import { CreateReviewUseCase } from '../domain/usecases/create-review.usecase';
import { DeleteReviewUseCase } from '../domain/usecases/delete-review.usecase';
import { ListReviewMediaOptionsUseCase } from '../domain/usecases/list-review-media-options.usecase';
import { ListReviewsByMediaUseCase } from '../domain/usecases/list-reviews-by-media.usecase';
import { UpdateReviewUseCase } from '../domain/usecases/update-review.usecase';
import { ReviewsRestDatasource } from '../infrastructure/datasources/reviews-rest.datasource';
import { ReviewsRepositoryImpl } from '../infrastructure/repositories/reviews.repository.impl';

/**
 * Raíz de composición (DI Container) del módulo `reviews`.
 * Es el único módulo que instancia el cliente HTTP, datasource y repositorio concretos,
 * inyectándolos hacia los casos de uso del dominio. Marcado `server-only` para proteger `API_URL`.
 */
export function createReviewsContainer() {
    const http = createFetchHttpClient();
    const repository = new ReviewsRepositoryImpl(new ReviewsRestDatasource(http));

    return {
        listMediaOptions: new ListReviewMediaOptionsUseCase(repository),
        listByMedia: new ListReviewsByMediaUseCase(repository),
        create: new CreateReviewUseCase(repository),
        update: new UpdateReviewUseCase(repository),
        remove: new DeleteReviewUseCase(repository),
    };
}

export const reviewsContainer = createReviewsContainer();

export type ReviewsContainer = ReturnType<typeof createReviewsContainer>;
