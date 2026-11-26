import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ActionResult } from '@/src/shared/domain/action-result';
import { describeError } from '@/src/shared/domain/errors';
import type {
    CreateReportDraft,
    ReportFilters,
    ResolveReportDraft,
} from '../../domain/entities/report';
import type {
    ReportsFiltersViewModel,
    ReportsPageViewModel,
    ReviewReportViewModel,
} from '../viewmodels/reports.viewmodel';

/**
 * Dependencias inyectadas en el store para los thunks de `reports`.
 */
export interface ReportsDependencies {
    createReport: (
        reviewId: string,
        draft: CreateReportDraft,
    ) => Promise<ActionResult<ReviewReportViewModel>>;
    listReports: (filters: ReportFilters) => Promise<ActionResult<ReportsPageViewModel>>;
    resolveReport: (
        reportId: string,
        resolution: ResolveReportDraft,
    ) => Promise<ActionResult<ReviewReportViewModel>>;
}

export type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

/** Estado global de Redux para reportes y moderación de reseñas. */
export interface ReportsState {
    items: ReviewReportViewModel[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    filters: ReportsFiltersViewModel;
    status: RequestStatus;
    mutationStatus: RequestStatus;
    errorMessage: string | null;
    successMessage: string | null;
}

const initialState: ReportsState = {
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    filters: { status: 'OPEN', page: 1, limit: 10 },
    status: 'idle',
    mutationStatus: 'idle',
    errorMessage: null,
    successMessage: null,
};

const createAppThunk = createAsyncThunk.withTypes<{
    state: { reports: ReportsState };
    extra: { reports: ReportsDependencies };
    rejectValue: string;
}>();

/** Query: carga una página de reportes según el filtro de estado activo. */
export const fetchReportsQuery = createAppThunk(
    'reports/fetch',
    async (filters: ReportFilters, { extra, rejectWithValue }) => {
        try {
            const result = await extra.reports.listReports(filters);
            if (!result.ok) return rejectWithValue(result.message);
            return result.data;
        } catch (err) {
            return rejectWithValue(describeError(err, 'No se pudieron cargar los reportes'));
        }
    },
);

/** Mutation: crea un reporte sobre una reseña ajena. */
export const createReviewReportMutation = createAppThunk(
    'reports/create',
    async (
        input: { reviewId: string; draft: CreateReportDraft },
        { extra, rejectWithValue },
    ) => {
        try {
            const result = await extra.reports.createReport(input.reviewId, input.draft);
            if (!result.ok) return rejectWithValue(result.message);
            return result.data;
        } catch (err) {
            return rejectWithValue(describeError(err, 'No se pudo enviar el reporte'));
        }
    },
);

/** Mutation: resuelve un reporte en moderación (`HIDE` o `DISMISS`). */
export const resolveReportMutation = createAppThunk(
    'reports/resolve',
    async (
        input: { reportId: string; resolution: ResolveReportDraft },
        { extra, rejectWithValue },
    ) => {
        try {
            const result = await extra.reports.resolveReport(input.reportId, input.resolution);
            if (!result.ok) return rejectWithValue(result.message);
            return result.data;
        } catch (err) {
            return rejectWithValue(describeError(err, 'No se pudo resolver el reporte'));
        }
    },
);

/**
 * Slice de Redux Toolkit para el módulo `reports`.
 */
export const reportsSlice = createSlice({
    name: 'reports',
    initialState,
    reducers: {
        setReportsFilters: (state, action: PayloadAction<Partial<ReportsFiltersViewModel>>) => {
            state.filters = { ...state.filters, page: 1, ...action.payload };
        },
        clearReportsFeedback: (state) => {
            state.errorMessage = null;
            state.successMessage = null;
            if (state.status === 'failed') state.status = 'idle';
            if (state.mutationStatus === 'failed' || state.mutationStatus === 'succeeded') {
                state.mutationStatus = 'idle';
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchReportsQuery.pending, (state) => {
                state.status = 'loading';
                state.errorMessage = null;
            })
            .addCase(fetchReportsQuery.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload.items;
                state.total = action.payload.total;
                state.page = action.payload.page;
                state.limit = action.payload.limit;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(fetchReportsQuery.rejected, (state, action) => {
                state.status = 'failed';
                state.errorMessage =
                    action.payload ?? action.error.message ?? 'No se pudieron cargar los reportes';
            })
            .addCase(createReviewReportMutation.pending, (state) => {
                state.mutationStatus = 'loading';
                state.errorMessage = null;
                state.successMessage = null;
            })
            .addCase(createReviewReportMutation.fulfilled, (state) => {
                state.mutationStatus = 'succeeded';
                state.successMessage = 'Reporte enviado correctamente para moderación.';
            })
            .addCase(createReviewReportMutation.rejected, (state, action) => {
                state.mutationStatus = 'failed';
                state.errorMessage =
                    action.payload ?? action.error.message ?? 'No se pudo enviar el reporte';
            })
            .addCase(resolveReportMutation.pending, (state) => {
                state.mutationStatus = 'loading';
                state.errorMessage = null;
                state.successMessage = null;
            })
            .addCase(resolveReportMutation.fulfilled, (state, action) => {
                state.mutationStatus = 'succeeded';
                state.successMessage =
                    action.payload.status === 'RESOLVED'
                        ? 'Reseña ocultada y reporte marcado como resuelto.'
                        : 'Reporte descartado; la reseña permanece visible.';
            })
            .addCase(resolveReportMutation.rejected, (state, action) => {
                state.mutationStatus = 'failed';
                state.errorMessage =
                    action.payload ?? action.error.message ?? 'No se pudo resolver el reporte';
            });
    },
});

export const { setReportsFilters, clearReportsFeedback } = reportsSlice.actions;
