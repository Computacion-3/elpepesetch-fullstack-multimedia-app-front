import type { Page } from '@/src/shared/domain/page';
import type {
    CreateReportDraft,
    ReportFilters,
    ResolveReportDraft,
    ReviewReport,
} from '../entities/report';

/**
 * Puerto de repositorio del dominio `reports`.
 * Define el contrato de acceso a datos para reportar reseñas y moderar reportes.
 */
export interface ReportsRepository {
    /** Registra un nuevo reporte sobre una reseña ajena. */
    createReport(token: string, reviewId: string, draft: CreateReportDraft): Promise<ReviewReport>;

    /** Lista los reportes paginados con filtro opcional por estado. */
    listReports(token: string, filters: ReportFilters): Promise<Page<ReviewReport>>;

    /** Resuelve un reporte abierto con acción `HIDE` o `DISMISS`. */
    resolveReport(
        token: string,
        reportId: string,
        resolution: ResolveReportDraft,
    ): Promise<ReviewReport>;
}
