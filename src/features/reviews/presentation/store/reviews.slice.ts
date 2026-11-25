import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { describeError } from '@/src/shared/domain/errors';
import type { ActionResult } from '@/src/shared/domain/action-result';
import type { CreateReviewDraft, ReviewQuery } from '../../domain/entities/review';
import type { ReviewViewModel } from '../viewmodels/review.viewmodel';

/** API externa inyectada desde Server Actions. */
export interface ReviewsDependencies {
  list: (mediaItemId: string, query: ReviewQuery) => Promise<ActionResult<{
    data: ReviewViewModel[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }>>;
  create: (mediaItemId: string, draft: CreateReviewDraft) => Promise<ActionResult<ReviewViewModel>>;
}

type Status = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface ReviewsState {
  mediaItemId: string | null;
  items: ReviewViewModel[];
  meta: { total: number; page: number; limit: number; totalPages: number };
  query: ReviewQuery;
  status: Status;
  mutationStatus: Status;
  errorMessage: string | null;
}

const initialState: ReviewsState = {
  mediaItemId: null,
  items: [],
  meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
  query: { page: 1, limit: 10 },
  status: 'idle',
  mutationStatus: 'idle',
  errorMessage: null,
};

const createReviewsThunk = createAsyncThunk.withTypes<{
  state: { reviews: ReviewsState };
  extra: { reviews: ReviewsDependencies };
  rejectValue: string;
}>();

/** Carga reseñas visibles para un elemento. */
export const fetchReviews = createReviewsThunk(
  'reviews/list',
  async (input: { mediaItemId: string; query: ReviewQuery }, { extra, rejectWithValue }) => {
    try {
      const result = await extra.reviews.list(input.mediaItemId, input.query);
      if (!result.ok) return rejectWithValue(result.message);
      return { ...result.data, mediaItemId: input.mediaItemId, query: input.query };
    } catch (error) {
      return rejectWithValue(describeError(error, 'No se pudieron cargar las reseñas.'));
    }
  },
);

/** Publica una reseña después de la validación del dominio y del backend. */
export const submitReview = createReviewsThunk(
  'reviews/create',
  async (input: { mediaItemId: string; draft: CreateReviewDraft }, { extra, rejectWithValue }) => {
    try {
      const result = await extra.reviews.create(input.mediaItemId, input.draft);
      if (!result.ok) return rejectWithValue(result.message);
      return { review: result.data, mediaItemId: input.mediaItemId };
    } catch (error) {
      return rejectWithValue(describeError(error, 'No se pudo publicar la reseña.'));
    }
  },
);

export const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    /** Marca en la lista una reseña que el moderador acaba de ocultar. */
    hideReviewFromSocket: (state, action: PayloadAction<{ reviewId: string; mediaItemId: string; hiddenReason: string }>) => {
      if (state.mediaItemId !== action.payload.mediaItemId) return;
      state.items = state.items.map((item) => item.id === action.payload.reviewId
        ? { ...item, isHidden: true, hiddenReason: action.payload.hiddenReason }
        : item);
    },
    clearReviews: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state, action) => {
        if (state.mediaItemId !== action.meta.arg.mediaItemId) state.items = [];
        state.mediaItemId = action.meta.arg.mediaItemId;
        state.query = action.meta.arg.query;
        state.status = 'loading';
        state.errorMessage = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        if (state.mediaItemId !== action.payload.mediaItemId) return;
        state.items = action.payload.data;
        state.meta = action.payload.meta;
        state.status = 'succeeded';
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.status = 'failed';
        state.errorMessage = action.payload ?? 'No se pudieron cargar las reseñas.';
      })
      .addCase(submitReview.pending, (state) => {
        state.mutationStatus = 'loading';
        state.errorMessage = null;
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        if (state.mediaItemId !== action.payload.mediaItemId) return;
        if (state.items.every((item) => item.id !== action.payload.review.id)) state.items.unshift(action.payload.review);
        state.meta.total += 1;
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.errorMessage = action.payload ?? 'No se pudo publicar la reseña.';
      });
  },
});

export const { hideReviewFromSocket, clearReviews } = reviewsSlice.actions;
