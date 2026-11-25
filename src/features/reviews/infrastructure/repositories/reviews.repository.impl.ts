import { toDomainError } from '@/src/shared/infrastructure/error-translator';
import type { CreateReviewDraft, Review, ReviewPage, ReviewQuery } from '../../domain/entities/review';
import type { ReviewsRepository } from '../../domain/repositories/reviews.repository';
import type { ReviewsDatasource } from '../datasources/reviews.datasource';
import { ReviewMapper } from '../mappers/review.mapper';

/** Traduce errores HTTP y normaliza las reseñas recibidas por REST. */
export class ReviewsRepositoryImpl implements ReviewsRepository {
  constructor(private readonly datasource: ReviewsDatasource) {}

  async listByMedia(mediaItemId: string, query: ReviewQuery): Promise<ReviewPage> {
    try {
      const result = await this.datasource.fetchByMedia(mediaItemId, query);
      return { ...result, data: result.data.map(ReviewMapper.toDomain) };
    } catch (error) { throw toDomainError(error); }
  }

  async create(mediaItemId: string, draft: CreateReviewDraft): Promise<Review> {
    try { return ReviewMapper.toDomain(await this.datasource.create(mediaItemId, draft)); }
    catch (error) { throw toDomainError(error); }
  }
}
