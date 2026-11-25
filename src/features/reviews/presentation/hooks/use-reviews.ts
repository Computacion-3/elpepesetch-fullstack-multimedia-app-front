'use client';

import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import type { CreateReviewDraft, ReviewQuery } from '../../domain/entities/review';
import { clearReviews, fetchReviews, submitReview } from '../store/reviews.slice';
import { selectReviewMutationStatus, selectReviews, selectReviewsError, selectReviewsMeta, selectReviewsStatus } from '../store/reviews.selectors';

/** Fachada de la lista de reseñas y su formulario de creación. */
export function useReviews(mediaItemId: string) {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectReviews);
  const meta = useAppSelector(selectReviewsMeta);
  const status = useAppSelector(selectReviewsStatus);
  const mutationStatus = useAppSelector(selectReviewMutationStatus);
  const errorMessage = useAppSelector(selectReviewsError);

  useEffect(() => {
    void dispatch(fetchReviews({ mediaItemId, query: { page: 1, limit: 10 } }));
    return () => { dispatch(clearReviews()); };
  }, [dispatch, mediaItemId]);

  const load = useCallback((query: ReviewQuery) => {
    void dispatch(fetchReviews({ mediaItemId, query }));
  }, [dispatch, mediaItemId]);

  const create = useCallback(async (draft: CreateReviewDraft) => {
    const result = await dispatch(submitReview({ mediaItemId, draft }));
    return submitReview.fulfilled.match(result);
  }, [dispatch, mediaItemId]);

  return { items, meta, status, mutationStatus, errorMessage, load, create };
}
