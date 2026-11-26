import { createSelector } from '@reduxjs/toolkit';
import type { ReportsState } from './reports.slice';

type State = { reports: ReportsState };

/** Selecciona la lista de reportes de la página actual. */
export const selectReports = (state: State) => state.reports.items;
export const selectReportsTotal = (state: State) => state.reports.total;
export const selectReportsCurrentPage = (state: State) => state.reports.page;
export const selectReportsLimit = (state: State) => state.reports.limit;
export const selectReportsTotalPages = (state: State) => state.reports.totalPages;

/** Selector memoizado con los metadatos de paginación de reportes. */
export const selectReportsPage = createSelector(
    [
        selectReportsTotal,
        selectReportsCurrentPage,
        selectReportsLimit,
        selectReportsTotalPages,
    ],
    (total, page, limit, totalPages) => ({ total, page, limit, totalPages }),
);

export const selectReportsFilters = (state: State) => state.reports.filters;
export const selectReportsStatus = (state: State) => state.reports.status;
export const selectReportsMutationStatus = (state: State) => state.reports.mutationStatus;
export const selectReportsError = (state: State) => state.reports.errorMessage;
export const selectReportsSuccess = (state: State) => state.reports.successMessage;
