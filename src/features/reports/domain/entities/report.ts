import { ValidationError } from '@/src/shared/domain/errors';
import type { Page } from '@/src/shared/domain/page';

/** Longitud máxima para comentarios de reporte y motivos de resolución/ocultamiento. */
export const REPORT_TEXT_MAX_LENGTH = 255;

/** Motivos válidos para reportar una reseña de otro usuario. */
export type ReportReason = 'SPOILER' | 'OFFENSIVE' | 'SPAM' | 'OTHER';

/** Estados posibles de un reporte dentro del flujo de moderación. */
export type ReportStatus = 'OPEN' | 'RESOLVED' | 'DISMISSED';

/** Acciones disponibles para un moderador al resolver un reporte abierto. */
export type ReportResolutionAction = 'HIDE' | 'DISMISS';

/** Datos de entrada para crear un reporte sobre una reseña ajena. */
export interface CreateReportDraft {
    reason: ReportReason;
    comment?: string;
}

/** Datos de entrada para resolver un reporte en moderación. */
export interface ResolveReportDraft {
    action: ReportResolutionAction;
    reason?: string;
}

/** Filtros y paginación para consultar reportes en el panel de moderación. */
export interface ReportFilters {
    status?: ReportStatus;
    page: number;
    limit: number;
}

/** Información resumida de la reseña asociada a un reporte. */
export interface ReportedReviewSummary {
    readonly id: string;
    readonly title: string | null;
    readonly content: string;
    readonly isHidden: boolean;
    readonly hiddenReason: string | null;
    readonly authorId: number;
    readonly authorUsername: string;
    readonly mediaItemId: string;
    readonly mediaTitle: string;
}

/** Valida los datos al crear un reporte de reseña. */
export function assertValidReportDraft(reviewId: string, draft: CreateReportDraft): void {
    if (!reviewId.trim()) {
        throw new ValidationError('No se indicó la reseña a reportar');
    }
    const validReasons: readonly ReportReason[] = ['SPOILER', 'OFFENSIVE', 'SPAM', 'OTHER'];
    if (!validReasons.includes(draft.reason)) {
        throw new ValidationError('Selecciona un motivo válido para el reporte');
    }
    if (draft.comment && draft.comment.trim().length > REPORT_TEXT_MAX_LENGTH) {
        throw new ValidationError(
            `El comentario adicional no puede superar ${REPORT_TEXT_MAX_LENGTH} caracteres`,
        );
    }
}

/** Valida la acción de resolución y exige motivo cuando la decisión es ocultar (`HIDE`). */
export function assertValidReportResolution(
    reportId: string,
    resolution: ResolveReportDraft,
): void {
    if (!reportId.trim()) {
        throw new ValidationError('No se indicó el reporte a resolver');
    }
    if (resolution.action !== 'HIDE' && resolution.action !== 'DISMISS') {
        throw new ValidationError('Selecciona una acción de moderación válida');
    }
    if (resolution.action === 'HIDE') {
        const reason = resolution.reason?.trim() ?? '';
        if (!reason) {
            throw new ValidationError('El motivo es obligatorio para ocultar una reseña');
        }
        if (reason.length > REPORT_TEXT_MAX_LENGTH) {
            throw new ValidationError(
                `El motivo de ocultamiento no puede superar ${REPORT_TEXT_MAX_LENGTH} caracteres`,
            );
        }
    }
}

/**
 * Entidad de dominio que representa un reporte sobre una reseña de comunidad.
 */
export class ReviewReport {
    constructor(
        readonly id: string,
        readonly reason: ReportReason,
        readonly comment: string | null,
        readonly status: ReportStatus,
        readonly createdAt: string,
        readonly resolvedAt: string | null,
        readonly review: ReportedReviewSummary,
        readonly reporterId: number,
        readonly reporterUsername: string,
        readonly resolvedByUsername: string | null,
    ) {}

    /** Indica si el reporte sigue pendiente de decisión por parte de un moderador. */
    isOpen(): boolean {
        return this.status === 'OPEN';
    }
}

export type ReportsPage = Page<ReviewReport>;
