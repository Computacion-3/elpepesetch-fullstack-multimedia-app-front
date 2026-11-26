import type { Page } from '@/src/shared/domain/page';
import type { ReportFilters, ReviewReport } from '../entities/report';
import type { ReportsRepository } from '../repositories/reports.repository';

/**
 * Caso de uso para listar reportes de moderación paginados y filtrables por estado.
 */
export class ListReviewReportsUseCase {
    constructor(private readonly repository: ReportsRepository) {}

    execute(token: string, filters: ReportFilters): Promise<Page<ReviewReport>> {
        return this.repository.listReports(token, filters);
    }
}
