import type {
    ReportReason,
    ReportStatus,
    ReviewReport,
} from '../../domain/entities/report';

const REASON_LABELS: Record<ReportReason, string> = {
    SPOILER: 'Spoiler sin aviso',
    OFFENSIVE: 'Contenido ofensivo',
    SPAM: 'Spam o publicidad',
    OTHER: 'Otro motivo',
};

const STATUS_LABELS: Record<ReportStatus, string> = {
    OPEN: 'Abierto',
    RESOLVED: 'Resuelto (Reseña oculta)',
    DISMISSED: 'Descartado',
};

/** ViewModel plano de un reporte de reseña listo para renderizar en UI. */
export interface ReviewReportViewModel {
    id: string;
    reason: ReportReason;
    reasonLabel: string;
    comment: string;
    status: ReportStatus;
    statusLabel: string;
    isOpen: boolean;
    formattedCreatedAt: string;
    formattedResolvedAt: string | null;
    reporterUsername: string;
    resolvedByUsername: string | null;
    reviewId: string;
    reviewTitle: string;
    reviewContent: string;
    reviewIsHidden: boolean;
    reviewHiddenReason: string | null;
    reviewAuthorUsername: string;
    mediaTitle: string;
}

/** Filtros activos de la bandeja de moderación guardados en Redux. */
export interface ReportsFiltersViewModel {
    status?: ReportStatus;
    page: number;
    limit: number;
}

/** Página serializable de reportes. */
export interface ReportsPageViewModel {
    items: ReviewReportViewModel[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

function formatDateEs(isoDate: string): string {
    const parsed = new Date(isoDate);
    if (Number.isNaN(parsed.getTime())) return isoDate;
    return new Intl.DateTimeFormat('es-CO', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(parsed);
}

/**
 * Mapper de entidades de dominio `ReviewReport` a ViewModels de presentación.
 */
export class ReportsViewModelMapper {
    static toViewModel(report: ReviewReport): ReviewReportViewModel {
        return {
            id: report.id,
            reason: report.reason,
            reasonLabel: REASON_LABELS[report.reason] ?? report.reason,
            comment: report.comment ?? '',
            status: report.status,
            statusLabel: STATUS_LABELS[report.status] ?? report.status,
            isOpen: report.isOpen(),
            formattedCreatedAt: formatDateEs(report.createdAt),
            formattedResolvedAt: report.resolvedAt ? formatDateEs(report.resolvedAt) : null,
            reporterUsername: report.reporterUsername,
            resolvedByUsername: report.resolvedByUsername,
            reviewId: report.review.id,
            reviewTitle: report.review.title ?? 'Reseña sin título',
            reviewContent: report.review.content,
            reviewIsHidden: report.review.isHidden,
            reviewHiddenReason: report.review.hiddenReason,
            reviewAuthorUsername: report.review.authorUsername,
            mediaTitle: report.review.mediaTitle,
        };
    }

    /** Acepta estructuralmente `Page<ReviewReport>` sin importar `shared-domain`. */
    static toPage(
        page: Omit<ReportsPageViewModel, 'items'> & { items: ReviewReport[] },
    ): ReportsPageViewModel {
        return {
            items: page.items.map((item) => ReportsViewModelMapper.toViewModel(item)),
            total: page.total,
            page: page.page,
            limit: page.limit,
            totalPages: page.totalPages,
        };
    }
}
