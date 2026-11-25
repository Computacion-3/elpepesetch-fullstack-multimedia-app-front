import type { Page } from '@/src/shared/domain/page';
import { toDomainError } from '@/src/shared/infrastructure/error-translator';
import type {
    Review,
    ReviewChanges,
    ReviewDraft,
    ReviewListQuery,
    ReviewMediaOption,
} from '../../domain/entities/review';
import type { ReviewsRepository } from '../../domain/repositories/reviews.repository';
import type { ReviewsDatasource } from '../datasources/reviews.datasource';
import { ReviewsMapper } from '../mappers/reviews.mapper';

/**
 * Implementación concreta de `ReviewsRepository`.
 * Coordina el datasource, aplica los mappers hacia el dominio y traduce errores HTTP a `DomainError`.
 */
export class ReviewsRepositoryImpl implements ReviewsRepository {
    constructor(private readonly datasource: ReviewsDatasource) {}

    async listMediaOptions(token: string): Promise<ReviewMediaOption[]> {
        try {
            const dtos = await this.datasource.listMediaOptions(token);
            return dtos
                .filter((item) => !item.approvalStatus || item.approvalStatus === 'APPROVED')
                .map((item) => ReviewsMapper.toMediaOption(item));
        } catch (err) {
            throw toDomainError(err);
        }
    }

    async listByMediaItem(token: string, query: ReviewListQuery): Promise<Page<Review>> {
        try {
            const dto = await this.datasource.listByMediaItem(
                token,
                query.mediaItemId,
                ReviewsMapper.toQueryString(query),
            );
            return ReviewsMapper.toPage(dto);
        } catch (err) {
            throw toDomainError(err);
        }
    }

    async create(token: string, mediaItemId: string, draft: ReviewDraft): Promise<Review> {
        try {
            const dto = await this.datasource.create(
                token,
                mediaItemId,
                ReviewsMapper.toCreateDto(draft),
            );
            return ReviewsMapper.toDomain(dto);
        } catch (err) {
            throw toDomainError(err);
        }
    }

    async update(token: string, id: string, changes: ReviewChanges): Promise<Review> {
        try {
            const dto = await this.datasource.update(
                token,
                id,
                ReviewsMapper.toUpdateDto(changes),
            );
            return ReviewsMapper.toDomain(dto);
        } catch (err) {
            throw toDomainError(err);
        }
    }

    async remove(token: string, id: string): Promise<void> {
        try {
            await this.datasource.remove(token, id);
        } catch (err) {
            throw toDomainError(err);
        }
    }
}
