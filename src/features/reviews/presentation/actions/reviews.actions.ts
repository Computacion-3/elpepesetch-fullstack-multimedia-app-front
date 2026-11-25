'use server';

import { runAuthenticated, runAuthorized } from '@/src/lib/run-authorized';
import type { ActionResult } from '@/src/shared/domain/action-result';
import { PERMISSIONS } from '@/src/shared/permissions';
import { reviewsContainer } from '../../di/reviews.container';
import type {
    ReviewChanges,
    ReviewDraft,
    ReviewListQuery,
} from '../../domain/entities/review';
import {
    ReviewsViewModelMapper,
    type ReviewMediaOptionViewModel,
    type ReviewsPageViewModel,
    type ReviewViewModel,
} from '../viewmodels/reviews.viewmodel';

/** Obtiene la lista de elementos multimedia disponibles para seleccionar y consultar reseñas. */
export async function listReviewMediaOptionsAction(): Promise<
    ActionResult<ReviewMediaOptionViewModel[]>
> {
    return runAuthenticated('No se pudo cargar el catálogo multimedia', async (token) => {
        const items = await reviewsContainer.listMediaOptions.execute(token);
        return items.map((item) => ReviewsViewModelMapper.toMediaOption(item));
    });
}

/** Lista las reseñas paginadas visibles de un elemento multimedia. */
export async function listReviewsByMediaAction(
    query: ReviewListQuery,
): Promise<ActionResult<ReviewsPageViewModel>> {
    return runAuthenticated('No se pudieron cargar las reseñas', async (token) =>
        ReviewsViewModelMapper.toPage(await reviewsContainer.listByMedia.execute(token, query)),
    );
}

/** Crea una reseña sobre un elemento multimedia verificando el permiso `reviews:create`. */
export async function createReviewAction(
    mediaItemId: string,
    draft: ReviewDraft,
): Promise<ActionResult<ReviewViewModel>> {
    return runAuthorized(
        PERMISSIONS.REVIEWS_CREATE,
        'No se pudo publicar la reseña',
        async (token) =>
            ReviewsViewModelMapper.toViewModel(
                await reviewsContainer.create.execute(token, mediaItemId, draft),
            ),
    );
}

/** Actualiza una reseña existente verificando el permiso `reviews:update`. */
export async function updateReviewAction(
    id: string,
    changes: ReviewChanges,
): Promise<ActionResult<ReviewViewModel>> {
    return runAuthorized(
        PERMISSIONS.REVIEWS_UPDATE,
        'No se pudo actualizar la reseña',
        async (token) =>
            ReviewsViewModelMapper.toViewModel(
                await reviewsContainer.update.execute(token, id, changes),
            ),
    );
}

/** Elimina una reseña existente verificando el permiso `reviews:delete`. */
export async function deleteReviewAction(id: string): Promise<ActionResult<null>> {
    return runAuthorized(
        PERMISSIONS.REVIEWS_DELETE,
        'No se pudo eliminar la reseña',
        async (token) => {
            await reviewsContainer.remove.execute(token, id);
            return null;
        },
    );
}
