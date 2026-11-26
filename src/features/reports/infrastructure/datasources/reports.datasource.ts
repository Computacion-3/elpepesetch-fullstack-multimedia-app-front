import type {
    CreateReportRequestDto,
    PaginatedReportsDto,
    ResolveReportRequestDto,
    ReviewReportDto,
} from '../dtos/reports.dto';

/**
 * Contrato de fuente de datos para el módulo `reports`.
 */
export interface ReportsDatasource {
    /** Envía la creación de un reporte sobre una reseña ajena. */
    createReport(
        token: string,
        reviewId: string,
        body: CreateReportRequestDto,
    ): Promise<ReviewReportDto>;

    /** Lista los reportes paginados y filtrados para moderación. */
    listReports(token: string, query: string): Promise<PaginatedReportsDto>;

    /** Resuelve un reporte abierto (`HIDE` o `DISMISS`). */
    resolveReport(
        token: string,
        reportId: string,
        body: ResolveReportRequestDto,
    ): Promise<ReviewReportDto>;
}
