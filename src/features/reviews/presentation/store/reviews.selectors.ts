import type { ReviewsState } from './reviews.slice';

type ReviewsRootState = { reviews: ReviewsState };

export const selectReviews = (state: ReviewsRootState) => state.reviews.items;
export const selectReviewsMeta = (state: ReviewsRootState) => state.reviews.meta;
export const selectReviewsQuery = (state: ReviewsRootState) => state.reviews.query;
export const selectReviewsStatus = (state: ReviewsRootState) => state.reviews.status;
export const selectReviewMutationStatus = (state: ReviewsRootState) => state.reviews.mutationStatus;
export const selectReviewsError = (state: ReviewsRootState) => state.reviews.errorMessage;
