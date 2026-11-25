import type {
    ReportReason,
    ReportResolutionAction,
    ReportStatus,
} from '../../domain/entities/report';

/** Usuario simplificado embebido en DTOs de reportes. */
export interface ReportUserDto {
    id: number;
    username?: string;
}

/** Reseña embebida dentro de un DTO de reporte. */
export interface ReportReviewDto {
    id: string;
    title?: string | null;
    content?: string;
    isHidden?: boolean;
    hiddenReason?: string | null;
    user?: ReportUserDto;
    mediaItem?: {
        id: string;
        title?: string;
    };
}

/** DTO devuelto por `POST /reviews/:reviewId/report`, `GET /reports` y `PATCH /reports/:id/resolve`. */
export interface ReviewReportDto {
    id: string;
    reason: ReportReason;
    comment: string | null;
    status: ReportStatus;
    createdAt: string;
    resolvedAt: string | null;
    review?: ReportReviewDto;
    reporter?: ReportUserDto;
    resolvedBy?: ReportUserDto | null;
}

/** Respuesta paginada del endpoint `GET /reports`. */
export interface PaginatedReportsDto {
    data: ReviewReportDto[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

/** Cuerpo JSON enviado a `POST /reviews/:reviewId/report`. */
export interface CreateReportRequestDto {
    reason: ReportReason;
    comment?: string;
}

/** Cuerpo JSON enviado a `PATCH /reports/:id/resolve`. */
export interface ResolveReportRequestDto {
    action: ReportResolutionAction;
    reason?: string;
}
