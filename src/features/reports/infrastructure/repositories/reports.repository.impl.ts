import type { Page } from '@/src/shared/domain/page';
import { toDomainError } from '@/src/shared/infrastructure/error-translator';
import type {
    CreateReportDraft,
    ReportFilters,
    ResolveReportDraft,
    ReviewReport,
} from '../../domain/entities/report';
import type { ReportsRepository } from '../../domain/repositories/reports.repository';
import type { ReportsDatasource } from '../datasources/reports.datasource';
import { ReportsMapper } from '../mappers/reports.mapper';

/**
 * Implementación concreta de `ReportsRepository` usando el datasource inyectado
 * y traduciendo excepciones de infraestructura a `DomainError`.
 */
export class ReportsRepositoryImpl implements ReportsRepository {
    constructor(private readonly datasource: ReportsDatasource) {}

    async createReport(
        token: string,
        reviewId: string,
        draft: CreateReportDraft,
    ): Promise<ReviewReport> {
        try {
            const dto = await this.datasource.createReport(
                token,
                reviewId,
                ReportsMapper.toCreateDto(draft),
            );
            return ReportsMapper.toDomain(dto);
        } catch (err) {
            throw toDomainError(err);
        }
    }

    async listReports(token: string, filters: ReportFilters): Promise<Page<ReviewReport>> {
        try {
            const dto = await this.datasource.listReports(
                token,
                ReportsMapper.toQueryString(filters),
            );
            return ReportsMapper.toPage(dto);
        } catch (err) {
            throw toDomainError(err);
        }
    }

    async resolveReport(
        token: string,
        reportId: string,
        resolution: ResolveReportDraft,
    ): Promise<ReviewReport> {
        try {
            const dto = await this.datasource.resolveReport(
                token,
                reportId,
                ReportsMapper.toResolveDto(resolution),
            );
            return ReportsMapper.toDomain(dto);
        } catch (err) {
            throw toDomainError(err);
        }
    }
}
