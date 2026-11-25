'use server';

import { runAuthenticated } from '@/src/lib/run-authenticated';
import { runAuthorized } from '@/src/lib/run-authorized';
import { PERMISSIONS } from '@/src/shared/permissions';
import type { ActionResult } from '@/src/shared/domain/action-result';
import type { CreateReviewDraft, ReviewQuery } from '../../domain/entities/review';
import { createReviewsContainer } from '../../di/reviews.container';
import { ReviewViewModelMapper } from '../viewmodels/review.viewmodel';
import type { ReviewViewModel } from '../viewmodels/review.viewmodel';

/** Lista únicamente las reseñas visibles para la cuenta que consulta. */
export async function listReviewsAction(mediaItemId: string, query: ReviewQuery): Promise<ActionResult<{
  data: ReviewViewModel[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}>> {
  return runAuthenticated('No se pudieron cargar las reseñas', async (token) => {
    const page = await createReviewsContainer(token).list.execute(mediaItemId, query);
    return { ...page, data: page.data.map(ReviewViewModelMapper.toViewModel) };
  });
}

/** Revalida el permiso para crear reseñas en cada llamada al backend. */
export async function createReviewAction(mediaItemId: string, draft: CreateReviewDraft): Promise<ActionResult<ReviewViewModel>> {
  return runAuthorized(PERMISSIONS.REVIEWS_CREATE, 'No se pudo publicar la reseña', async (token) => {
    const review = await createReviewsContainer(token).create.execute(mediaItemId, draft);
    return ReviewViewModelMapper.toViewModel(review);
  });
}
