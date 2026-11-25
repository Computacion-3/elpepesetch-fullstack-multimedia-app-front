import type { Page } from '@/src/shared/domain/page';
import {
    ReviewReport,
    type CreateReportDraft,
    type ReportFilters,
    type ResolveReportDraft,
} from '../../domain/entities/report';
import type {
    CreateReportRequestDto,
    PaginatedReportsDto,
    ResolveReportRequestDto,
    ReviewReportDto,
} from '../dtos/reports.dto';

/**
 * Traductor entre DTOs de reportes y entidades del dominio `reports`.
 */
export class ReportsMapper {
    static toDomain(dto: ReviewReportDto): ReviewReport {
        return new ReviewReport(
            dto.id,
            dto.reason,
            dto.comment ?? null,
            dto.status,
            dto.createdAt,
            dto.resolvedAt ?? null,
            {
                id: dto.review?.id ?? '',
                title: dto.review?.title ?? null,
                content: dto.review?.content ?? '',
                isHidden: Boolean(dto.review?.isHidden),
                hiddenReason: dto.review?.hiddenReason ?? null,
                authorId: dto.review?.user?.id ?? 0,
                authorUsername: dto.review?.user?.username ?? 'Autor',
                mediaItemId: dto.review?.mediaItem?.id ?? '',
                mediaTitle: dto.review?.mediaItem?.title ?? 'Elemento multimedia',
            },
            dto.reporter?.id ?? 0,
            dto.reporter?.username ?? 'Usuario',
            dto.resolvedBy?.username ?? null,
        );
    }

    static toPage(dto: PaginatedReportsDto): Page<ReviewReport> {
        return {
            items: dto.data.map((item) => ReportsMapper.toDomain(item)),
            total: dto.meta.total,
            page: dto.meta.page,
            limit: dto.meta.limit,
            totalPages: dto.meta.totalPages,
        };
    }

    static toQueryString(filters: ReportFilters): string {
        const params = new URLSearchParams();
        if (filters.status) params.set('status', filters.status);
        params.set('page', String(filters.page));
        params.set('limit', String(filters.limit));
        return params.toString();
    }

    static toCreateDto(draft: CreateReportDraft): CreateReportRequestDto {
        const body: CreateReportRequestDto = { reason: draft.reason };
        const comment = draft.comment?.trim();
        if (comment) body.comment = comment;
        return body;
    }

    static toResolveDto(resolution: ResolveReportDraft): ResolveReportRequestDto {
        const body: ResolveReportRequestDto = { action: resolution.action };
        const reason = resolution.reason?.trim();
        if (reason) body.reason = reason;
        return body;
    }
}
