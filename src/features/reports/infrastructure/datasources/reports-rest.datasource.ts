import type { HttpClient } from '@/src/shared/infrastructure/http-client';
import type {
    CreateReportRequestDto,
    PaginatedReportsDto,
    ResolveReportRequestDto,
    ReviewReportDto,
} from '../dtos/reports.dto';
import type { ReportsDatasource } from './reports.datasource';

/**
 * Implementación REST del datasource de reportes y moderación contra NestJS.
 */
export class ReportsRestDatasource implements ReportsDatasource {
    constructor(private readonly http: HttpClient) {}

    createReport(
        token: string,
        reviewId: string,
        body: CreateReportRequestDto,
    ): Promise<ReviewReportDto> {
        return this.http.post<ReviewReportDto>(`/reviews/${reviewId}/report`, body, token);
    }

    listReports(token: string, query: string): Promise<PaginatedReportsDto> {
        return this.http.get<PaginatedReportsDto>(`/reports?${query}`, token);
    }

    resolveReport(
        token: string,
        reportId: string,
        body: ResolveReportRequestDto,
    ): Promise<ReviewReportDto> {
        return this.http.patch<ReviewReportDto>(`/reports/${reportId}/resolve`, body, token);
    }
}
