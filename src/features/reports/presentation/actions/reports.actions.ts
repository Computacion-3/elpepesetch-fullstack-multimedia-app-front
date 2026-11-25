'use server';

import { runAuthorized } from '@/src/lib/run-authorized';
import type { ActionResult } from '@/src/shared/domain/action-result';
import { PERMISSIONS } from '@/src/shared/permissions';
import { reportsContainer } from '../../di/reports.container';
import type {
    CreateReportDraft,
    ReportFilters,
    ResolveReportDraft,
} from '../../domain/entities/report';
import {
    ReportsViewModelMapper,
    type ReportsPageViewModel,
    type ReviewReportViewModel,
} from '../viewmodels/reports.viewmodel';

/** Reporta una reseña ajena verificando el permiso `reports:create`. */
export async function createReviewReportAction(
    reviewId: string,
    draft: CreateReportDraft,
): Promise<ActionResult<ReviewReportViewModel>> {
    return runAuthorized(
        PERMISSIONS.REPORTS_CREATE,
        'No se pudo enviar el reporte',
        async (token) =>
            ReportsViewModelMapper.toViewModel(
                await reportsContainer.createReport.execute(token, reviewId, draft),
            ),
    );
}

/** Lista los reportes paginados para moderación verificando `reviews:moderate`. */
export async function listReviewReportsAction(
    filters: ReportFilters,
): Promise<ActionResult<ReportsPageViewModel>> {
    return runAuthorized(
        PERMISSIONS.REVIEWS_MODERATE,
        'No se pudieron cargar los reportes',
        async (token) =>
            ReportsViewModelMapper.toPage(
                await reportsContainer.listReports.execute(token, filters),
            ),
    );
}

/** Resuelve un reporte abierto (`HIDE` o `DISMISS`) verificando `reviews:moderate`. */
export async function resolveReviewReportAction(
    reportId: string,
    resolution: ResolveReportDraft,
): Promise<ActionResult<ReviewReportViewModel>> {
    return runAuthorized(
        PERMISSIONS.REVIEWS_MODERATE,
        'No se pudo resolver el reporte',
        async (token) =>
            ReportsViewModelMapper.toViewModel(
                await reportsContainer.resolveReport.execute(token, reportId, resolution),
            ),
    );
}
