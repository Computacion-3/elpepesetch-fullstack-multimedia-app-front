import 'server-only';
import { createFetchHttpClient } from '@/src/shared/infrastructure/http-client';
import { CreateReviewUseCase } from '../domain/usecases/create-review.usecase';
import { ListReviewsByMediaUseCase } from '../domain/usecases/list-reviews-by-media.usecase';
import { ReviewsRestDatasource } from '../infrastructure/datasources/reviews-rest.datasource';
import { ReviewsRepositoryImpl } from '../infrastructure/repositories/reviews.repository.impl';

/** Construye los casos de uso REST de reseñas para la sesión solicitante. */
export function createReviewsContainer(token: string) {
  const repository = new ReviewsRepositoryImpl(new ReviewsRestDatasource(createFetchHttpClient(), token));
  return {
    list: new ListReviewsByMediaUseCase(repository),
    create: new CreateReviewUseCase(repository),
  };
}
