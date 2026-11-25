import { createSelector } from '@reduxjs/toolkit';
import type { ReviewsState } from './reviews.slice';

type State = { reviews: ReviewsState };

/** Selecciona las opciones del catálogo multimedia para reseñar. */
export const selectReviewMediaOptions = (state: State) => state.reviews.mediaOptions;
/** Selecciona el estado de carga de las opciones de catálogo. */
export const selectReviewMediaOptionsStatus = (state: State) => state.reviews.mediaOptionsStatus;
/** Selecciona el identificador del elemento multimedia actualmente consultado. */
export const selectSelectedMediaId = (state: State) => state.reviews.selectedMediaId;
/** Selecciona las reseñas de la página actual. */
export const selectReviews = (state: State) => state.reviews.items;
export const selectReviewsTotal = (state: State) => state.reviews.total;
export const selectReviewsCurrentPage = (state: State) => state.reviews.page;
export const selectReviewsLimit = (state: State) => state.reviews.limit;
export const selectReviewsTotalPages = (state: State) => state.reviews.totalPages;

/** Selector memoizado para los metadatos de paginación de reseñas. */
export const selectReviewsPage = createSelector(
    [
        selectReviewsTotal,
        selectReviewsCurrentPage,
        selectReviewsLimit,
        selectReviewsTotalPages,
    ],
    (total, page, limit, totalPages) => ({ total, page, limit, totalPages }),
);

export const selectReviewsStatus = (state: State) => state.reviews.status;
export const selectReviewsMutationStatus = (state: State) => state.reviews.mutationStatus;
export const selectReviewsError = (state: State) => state.reviews.errorMessage;
export const selectReviewsSuccess = (state: State) => state.reviews.successMessage;
