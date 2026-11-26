import {
    assertValidReportResolution,
    type ResolveReportDraft,
    type ReviewReport,
} from '../entities/report';
import type { ReportsRepository } from '../repositories/reports.repository';

/**
 * Caso de uso para resolver un reporte abierto: ocultar la reseña (`HIDE`) o descartarlo (`DISMISS`).
 */
export class ResolveReviewReportUseCase {
    constructor(private readonly repository: ReportsRepository) {}

    execute(
        token: string,
        reportId: string,
        resolution: ResolveReportDraft,
    ): Promise<ReviewReport> {
        assertValidReportResolution(reportId, resolution);
        return this.repository.resolveReport(token, reportId, resolution);
    }
}
