import 'server-only';
import { createFetchHttpClient } from '@/src/shared/infrastructure/http-client';
import { CreateReviewReportUseCase } from '../domain/usecases/create-review-report.usecase';
import { ListReviewReportsUseCase } from '../domain/usecases/list-review-reports.usecase';
import { ResolveReviewReportUseCase } from '../domain/usecases/resolve-review-report.usecase';
import { ReportsRestDatasource } from '../infrastructure/datasources/reports-rest.datasource';
import { ReportsRepositoryImpl } from '../infrastructure/repositories/reports.repository.impl';

/**
 * Raíz de composición (DI Container) del módulo `reports`.
 * Cablea cliente HTTP, datasource REST, repositorio y casos de uso en el servidor.
 */
export function createReportsContainer() {
    const http = createFetchHttpClient();
    const repository = new ReportsRepositoryImpl(new ReportsRestDatasource(http));

    return {
        createReport: new CreateReviewReportUseCase(repository),
        listReports: new ListReviewReportsUseCase(repository),
        resolveReport: new ResolveReviewReportUseCase(repository),
    };
}

export const reportsContainer = createReportsContainer();

export type ReportsContainer = ReturnType<typeof createReportsContainer>;
