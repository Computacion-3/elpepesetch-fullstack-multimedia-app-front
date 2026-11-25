import { MediaItem } from '../../domain/entities/media-item';
import type { MediaApprovalDraft, MediaItemChanges, MediaItemDraft, MediaQuery } from '../../domain/entities/media-item';
import type { Page } from '@/src/shared/domain/page';
import type {
    CreateMediaItemDto,
    MediaApprovalDto,
    MediaItemDto,
    MediaQueryDto,
    PaginatedMediaDto,
    UpdateMediaItemDto,
} from '../dtos/media.dto';

/** Convierte entre contratos del dominio y formatos de los dos transportes. */
export class MediaMapper {
    static toDomain(dto: MediaItemDto): MediaItem {
        return new MediaItem({
            id: dto.id,
            title: dto.title,
            type: dto.type,
            description: dto.description ?? null,
            releaseYear: dto.releaseYear,
            creator: dto.creator,
            coverUrl: dto.coverUrl ?? null,
            platform: dto.platform ?? null,
            durationMinutes: dto.durationMinutes ?? null,
            pages: dto.pages ?? null,
            isbn: dto.isbn ?? null,
            approvalStatus: dto.approvalStatus,
            rejectionReason: dto.rejectionReason ?? null,
            averageRating: Number(dto.averageRating ?? 0),
            ratingsCount: dto.ratingsCount ?? 0,
            genres: (dto.genres ?? []).map(({ id, name }) => ({ id, name })),
            ...(dto.createdBy ? { createdBy: dto.createdBy } : {}),
            ...(dto.createdAt ? { createdAt: dto.createdAt } : {}),
            ...(dto.updatedAt ? { updatedAt: dto.updatedAt } : {}),
        });
    }

    static toPage(dto: PaginatedMediaDto): Page<MediaItem> {
        return {
            items: dto.data.map(MediaMapper.toDomain),
            total: dto.meta.total,
            page: dto.meta.page,
            limit: dto.meta.limit,
            totalPages: dto.meta.totalPages,
        };
    }

    static toQueryDto(query: MediaQuery): MediaQueryDto {
        return { ...query };
    }

    static toCreateDto(draft: MediaItemDraft): CreateMediaItemDto {
        return {
            ...draft,
            title: draft.title.trim(),
            creator: draft.creator.trim(),
            genreIds: [...draft.genreIds],
            ...MediaMapper.optionalTextFields(draft),
        };
    }

    static toUpdateDto(changes: MediaItemChanges): UpdateMediaItemDto {
        const dto: UpdateMediaItemDto = { ...changes };
        if (dto.title !== undefined) dto.title = dto.title.trim();
        if (dto.creator !== undefined) dto.creator = dto.creator.trim();
        if (dto.genreIds !== undefined) dto.genreIds = [...dto.genreIds];
        return dto;
    }

    static toApprovalDto(draft: MediaApprovalDraft): MediaApprovalDto {
        return {
            approvalStatus: draft.approvalStatus,
            ...(draft.rejectionReason ? { rejectionReason: draft.rejectionReason.trim() } : {}),
        };
    }

    /** Omite cadenas vacías opcionales al crear para cumplir con IsUrl y otros validadores. */
    private static optionalTextFields(draft: MediaItemDraft): Partial<CreateMediaItemDto> {
        return {
            ...(draft.description !== undefined ? { description: draft.description.trim() } : {}),
            ...(draft.coverUrl?.trim() ? { coverUrl: draft.coverUrl.trim() } : {}),
            ...(draft.platform?.trim() ? { platform: draft.platform.trim() } : {}),
            ...(draft.isbn?.trim() ? { isbn: draft.isbn.trim() } : {}),
        };
    }
}
