'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import type { CreateReportDraft, ResolveReportDraft } from '../../domain/entities/report';
import {
    clearReportsFeedback,
    createReviewReportMutation,
    fetchReportsQuery,
    resolveReportMutation,
    setReportsFilters,
} from '../store/reports.slice';
import {
    selectReports,
    selectReportsError,
    selectReportsFilters,
    selectReportsMutationStatus,
    selectReportsPage,
    selectReportsStatus,
    selectReportsSuccess,
} from '../store/reports.selectors';
import type { ReportsFiltersViewModel } from '../viewmodels/reports.viewmodel';

/**
 * Hook fachada del módulo `reports`.
 * Centraliza la creación de reportes desde reseñas y el flujo completo de moderación.
 */
export function useReports() {
    const dispatch = useAppDispatch();
    const reports = useAppSelector(selectReports);
    const page = useAppSelector(selectReportsPage);
    const filters = useAppSelector(selectReportsFilters);
    const status = useAppSelector(selectReportsStatus);
    const mutationStatus = useAppSelector(selectReportsMutationStatus);
    const errorMessage = useAppSelector(selectReportsError);
    const successMessage = useAppSelector(selectReportsSuccess);

    /** Carga la página de reportes aplicando los filtros actuales del store. */
    const load = useCallback(async (): Promise<void> => {
        await dispatch(fetchReportsQuery(filters));
    }, [dispatch, filters]);

    /** Actualiza los filtros (estado o página) reiniciando a página 1 cuando cambia el filtro. */
    const setFilters = useCallback(
        (partial: Partial<ReportsFiltersViewModel>) => {
            dispatch(setReportsFilters(partial));
        },
        [dispatch],
    );

    /** Envía un nuevo reporte sobre una reseña ajena. */
    const submitReport = useCallback(
        async (reviewId: string, draft: CreateReportDraft): Promise<boolean> => {
            const action = await dispatch(createReviewReportMutation({ reviewId, draft }));
            return createReviewReportMutation.fulfilled.match(action);
        },
        [dispatch],
    );

    /** Resuelve un reporte (`HIDE` o `DISMISS`) y recarga la bandeja de moderación. */
    const resolveReport = useCallback(
        async (reportId: string, resolution: ResolveReportDraft): Promise<boolean> => {
            const action = await dispatch(resolveReportMutation({ reportId, resolution }));
            const ok = resolveReportMutation.fulfilled.match(action);
            if (ok) {
                const shouldStepBack =
                    filters.status === 'OPEN' && reports.length <= 1 && filters.page > 1;
                const nextPage = shouldStepBack ? filters.page - 1 : filters.page;
                if (shouldStepBack) {
                    dispatch(setReportsFilters({ page: nextPage }));
                }
                await dispatch(fetchReportsQuery({ ...filters, page: nextPage }));
            }
            return ok;
        },
        [dispatch, filters, reports.length],
    );

    /** Limpia mensajes previos de error o confirmación. */
    const clearFeedback = useCallback(() => {
        dispatch(clearReportsFeedback());
    }, [dispatch]);

    return {
        reports,
        page,
        filters,
        isLoading: status === 'loading',
        isMutating: mutationStatus === 'loading',
        errorMessage,
        successMessage,
        load,
        setFilters,
        submitReport,
        resolveReport,
        clearFeedback,
    };
}
