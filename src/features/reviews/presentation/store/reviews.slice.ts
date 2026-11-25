import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ActionResult } from '@/src/shared/domain/action-result';
import { describeError } from '@/src/shared/domain/errors';
import type {
    ReviewChanges,
    ReviewDraft,
    ReviewListQuery,
} from '../../domain/entities/review';
import type {
    ReviewMediaOptionViewModel,
    ReviewsPageViewModel,
    ReviewViewModel,
} from '../viewmodels/reviews.viewmodel';

/**
 * Contrato de dependencias que los thunks de `reviews` reciben vía `extraArgument`.
 * En producción/desarrollo son Server Actions inyectadas desde `src/store/store.ts`.
 */
export interface ReviewsDependencies {
    listMediaOptions: () => Promise<ActionResult<ReviewMediaOptionViewModel[]>>;
    listByMedia: (query: ReviewListQuery) => Promise<ActionResult<ReviewsPageViewModel>>;
    create: (mediaItemId: string, draft: ReviewDraft) => Promise<ActionResult<ReviewViewModel>>;
    update: (id: string, changes: ReviewChanges) => Promise<ActionResult<ReviewViewModel>>;
    remove: (id: string) => Promise<ActionResult<null>>;
}

export type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

/** Estado global de Redux para el módulo de reseñas de la comunidad. */
export interface ReviewsState {
    mediaOptions: ReviewMediaOptionViewModel[];
    mediaOptionsStatus: RequestStatus;
    selectedMediaId: string;
    items: ReviewViewModel[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    status: RequestStatus;
    mutationStatus: RequestStatus;
    errorMessage: string | null;
    successMessage: string | null;
}

const initialState: ReviewsState = {
    mediaOptions: [],
    mediaOptionsStatus: 'idle',
    selectedMediaId: '',
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    status: 'idle',
    mutationStatus: 'idle',
    errorMessage: null,
    successMessage: null,
};

const createAppThunk = createAsyncThunk.withTypes<{
    state: { reviews: ReviewsState };
    extra: { reviews: ReviewsDependencies };
    rejectValue: string;
}>();

/** Query: carga los elementos multimedia disponibles para reseñar. */
export const fetchReviewMediaOptionsQuery = createAppThunk(
    'reviews/fetchMediaOptions',
    async (_, { extra, rejectWithValue }) => {
        try {
            const result = await extra.reviews.listMediaOptions();
            if (!result.ok) return rejectWithValue(result.message);
            return result.data;
        } catch (err) {
            return rejectWithValue(describeError(err, 'No se pudo cargar el catálogo multimedia'));
        }
    },
);

/** Query: carga una página de reseñas para el elemento multimedia seleccionado. */
export const fetchReviewsByMediaQuery = createAppThunk(
    'reviews/fetchByMedia',
    async (query: ReviewListQuery, { extra, rejectWithValue }) => {
        try {
            const result = await extra.reviews.listByMedia(query);
            if (!result.ok) return rejectWithValue(result.message);
            return result.data;
        } catch (err) {
            return rejectWithValue(describeError(err, 'No se pudieron cargar las reseñas'));
        }
    },
);

/** Mutation: crea una reseña nueva para el elemento multimedia activo. */
export const createReviewMutation = createAppThunk(
    'reviews/create',
    async (
        input: { mediaItemId: string; draft: ReviewDraft },
        { extra, rejectWithValue },
    ) => {
        try {
            const result = await extra.reviews.create(input.mediaItemId, input.draft);
            if (!result.ok) return rejectWithValue(result.message);
            return result.data;
        } catch (err) {
            return rejectWithValue(describeError(err, 'No se pudo publicar la reseña'));
        }
    },
);

/** Mutation: actualiza una reseña existente. */
export const updateReviewMutation = createAppThunk(
    'reviews/update',
    async (input: { id: string; changes: ReviewChanges }, { extra, rejectWithValue }) => {
        try {
            const result = await extra.reviews.update(input.id, input.changes);
            if (!result.ok) return rejectWithValue(result.message);
            return result.data;
        } catch (err) {
            return rejectWithValue(describeError(err, 'No se pudo actualizar la reseña'));
        }
    },
);

/** Mutation: elimina una reseña existente. */
export const deleteReviewMutation = createAppThunk(
    'reviews/delete',
    async (id: string, { extra, rejectWithValue }) => {
        try {
            const result = await extra.reviews.remove(id);
            if (!result.ok) return rejectWithValue(result.message);
            return result.data;
        } catch (err) {
            return rejectWithValue(describeError(err, 'No se pudo eliminar la reseña'));
        }
    },
);

/**
 * Slice de Redux Toolkit para el módulo `reviews`.
 * Administra la lista paginada de reseñas, selección de medio y mensajes de estado.
 */
export const reviewsSlice = createSlice({
    name: 'reviews',
    initialState,
    reducers: {
        /** Refleja el ocultamiento recibido por WebSocket en el elemento actualmente abierto. */
        hideReviewFromSocket: (state, action: PayloadAction<{ reviewId: string; mediaItemId: string; hiddenReason: string }>) => {
            if (state.selectedMediaId !== action.payload.mediaItemId) return;
            state.items = state.items.map((review) => review.id === action.payload.reviewId
                ? { ...review, isHidden: true, hiddenReason: action.payload.hiddenReason }
                : review);
        },
        setSelectedMediaId: (state, action: PayloadAction<string>) => {
            state.selectedMediaId = action.payload;
            state.page = 1;
            state.errorMessage = null;
        },
        setReviewsPage: (state, action: PayloadAction<number>) => {
            state.page = Math.max(1, action.payload);
        },
        clearReviewsFeedback: (state) => {
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
            .addCase(fetchReviewMediaOptionsQuery.pending, (state) => {
                state.mediaOptionsStatus = 'loading';
            })
            .addCase(fetchReviewMediaOptionsQuery.fulfilled, (state, action) => {
                state.mediaOptionsStatus = 'succeeded';
                state.mediaOptions = action.payload;
                if (!state.selectedMediaId && action.payload.length > 0) {
                    state.selectedMediaId = action.payload[0].id;
                }
            })
            .addCase(fetchReviewMediaOptionsQuery.rejected, (state, action) => {
                state.mediaOptionsStatus = 'failed';
                state.errorMessage =
                    action.payload ?? action.error.message ?? 'No se pudo cargar el catálogo';
            })
            .addCase(fetchReviewsByMediaQuery.pending, (state) => {
                state.status = 'loading';
                state.errorMessage = null;
            })
            .addCase(fetchReviewsByMediaQuery.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload.items;
                state.total = action.payload.total;
                state.page = action.payload.page;
                state.limit = action.payload.limit;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(fetchReviewsByMediaQuery.rejected, (state, action) => {
                state.status = 'failed';
                state.errorMessage =
                    action.payload ?? action.error.message ?? 'No se pudieron cargar las reseñas';
            })
            .addCase(createReviewMutation.pending, (state) => {
                state.mutationStatus = 'loading';
                state.errorMessage = null;
                state.successMessage = null;
            })
            .addCase(createReviewMutation.fulfilled, (state) => {
                state.mutationStatus = 'succeeded';
                state.successMessage = 'Reseña publicada correctamente.';
            })
            .addCase(createReviewMutation.rejected, (state, action) => {
                state.mutationStatus = 'failed';
                state.errorMessage =
                    action.payload ?? action.error.message ?? 'No se pudo publicar la reseña';
            })
            .addCase(updateReviewMutation.pending, (state) => {
                state.mutationStatus = 'loading';
                state.errorMessage = null;
                state.successMessage = null;
            })
            .addCase(updateReviewMutation.fulfilled, (state) => {
                state.mutationStatus = 'succeeded';
                state.successMessage = 'Reseña actualizada correctamente.';
            })
            .addCase(updateReviewMutation.rejected, (state, action) => {
                state.mutationStatus = 'failed';
                state.errorMessage =
                    action.payload ?? action.error.message ?? 'No se pudo actualizar la reseña';
            })
            .addCase(deleteReviewMutation.pending, (state) => {
                state.mutationStatus = 'loading';
                state.errorMessage = null;
                state.successMessage = null;
            })
            .addCase(deleteReviewMutation.fulfilled, (state) => {
                state.mutationStatus = 'succeeded';
                state.successMessage = 'Reseña eliminada correctamente.';
            })
            .addCase(deleteReviewMutation.rejected, (state, action) => {
                state.mutationStatus = 'failed';
                state.errorMessage =
                    action.payload ?? action.error.message ?? 'No se pudo eliminar la reseña';
            });
    },
});

export const { hideReviewFromSocket, setSelectedMediaId, setReviewsPage, clearReviewsFeedback } = reviewsSlice.actions;
