import {
    assertValidReportDraft,
    type CreateReportDraft,
    type ReviewReport,
} from '../entities/report';
import type { ReportsRepository } from '../repositories/reports.repository';

/**
 * Caso de uso para reportar una reseña ajena por spoiler, contenido ofensivo, spam u otro motivo.
 */
export class CreateReviewReportUseCase {
    constructor(private readonly repository: ReportsRepository) {}

    execute(token: string, reviewId: string, draft: CreateReportDraft): Promise<ReviewReport> {
        assertValidReportDraft(reviewId, draft);
        return this.repository.createReport(token, reviewId, draft);
    }
}
