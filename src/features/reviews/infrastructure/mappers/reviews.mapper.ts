import type { Page } from '@/src/shared/domain/page';
import {
    Review,
    type ReviewChanges,
    type ReviewDraft,
    type ReviewListQuery,
    type ReviewMediaOption,
} from '../../domain/entities/review';
import type {
    CatalogMediaDto,
    CreateReviewRequestDto,
    PaginatedReviewsDto,
    ReviewDto,
    UpdateReviewRequestDto,
} from '../dtos/reviews.dto';

/**
 * Traductor bidireccional entre los DTOs de red y las entidades puras del dominio `reviews`.
 */
export class ReviewsMapper {
    static toDomain(dto: ReviewDto): Review {
        return new Review(
            dto.id,
            dto.mediaItem?.id ?? '',
            dto.mediaItem?.title ?? '',
            dto.mediaItem?.type ?? 'GAME',
            dto.user?.id ?? 0,
            dto.user?.username ?? 'Usuario',
            dto.user?.fullName ?? null,
            dto.title ?? null,
            dto.content,
            Boolean(dto.isHidden),
            dto.hiddenReason ?? null,
            dto.createdAt,
            dto.updatedAt,
        );
    }

    static toPage(dto: PaginatedReviewsDto): Page<Review> {
        return {
            items: dto.data.map((item) => ReviewsMapper.toDomain(item)),
            total: dto.meta.total,
            page: dto.meta.page,
            limit: dto.meta.limit,
            totalPages: dto.meta.totalPages,
        };
    }

    static toMediaOption(dto: CatalogMediaDto): ReviewMediaOption {
        return {
            id: dto.id,
            title: dto.title,
            type: dto.type,
            creator: dto.creator ?? '',
            releaseYear: dto.releaseYear ?? 0,
        };
    }

    static toQueryString(query: Pick<ReviewListQuery, 'page' | 'limit'>): string {
        const params = new URLSearchParams();
        params.set('page', String(query.page));
        params.set('limit', String(query.limit));
        return params.toString();
    }

    static toCreateDto(draft: ReviewDraft): CreateReviewRequestDto {
        const body: CreateReviewRequestDto = {
            content: draft.content.trim(),
        };
        const title = draft.title?.trim();
        if (title) body.title = title;
        return body;
    }

    static toUpdateDto(changes: ReviewChanges): UpdateReviewRequestDto {
        const body: UpdateReviewRequestDto = {};
        if (changes.title !== undefined) {
            body.title = changes.title.trim();
        }
        if (changes.content !== undefined) {
            body.content = changes.content.trim();
        }
        return body;
    }
}
