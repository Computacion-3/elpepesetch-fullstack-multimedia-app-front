'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import type { ReviewChanges, ReviewDraft } from '../../domain/entities/review';
import {
    clearReviewsFeedback,
    createReviewMutation,
    deleteReviewMutation,
    fetchReviewMediaOptionsQuery,
    fetchReviewsByMediaQuery,
    hideReviewFromSocket,
    setReviewsPage,
    setSelectedMediaId,
    updateReviewMutation,
} from '../store/reviews.slice';
import {
    selectReviewMediaOptions,
    selectReviewMediaOptionsStatus,
    selectReviews,
    selectReviewsError,
    selectReviewsMutationStatus,
    selectReviewsPage,
    selectReviewsStatus,
    selectReviewsSuccess,
    selectSelectedMediaId,
} from '../store/reviews.selectors';

/**
 * Hook fachada del módulo `reviews`.
 * Es la única interfaz que consumen los componentes visuales de reseñas;
 * encapsula Redux Toolkit, dispatchers de thunks y recarga tras mutaciones.
 */
export function useReviews() {
    const dispatch = useAppDispatch();
    const mediaOptions = useAppSelector(selectReviewMediaOptions);
    const mediaOptionsStatus = useAppSelector(selectReviewMediaOptionsStatus);
    const selectedMediaId = useAppSelector(selectSelectedMediaId);
    const reviews = useAppSelector(selectReviews);
    const page = useAppSelector(selectReviewsPage);
    const status = useAppSelector(selectReviewsStatus);
    const mutationStatus = useAppSelector(selectReviewsMutationStatus);
    const errorMessage = useAppSelector(selectReviewsError);
    const successMessage = useAppSelector(selectReviewsSuccess);

    /** Carga las opciones de elementos multimedia del catálogo. */
    const loadMediaOptions = useCallback(async (): Promise<void> => {
        await dispatch(fetchReviewMediaOptionsQuery());
    }, [dispatch]);

    /** Carga las reseñas del elemento multimedia seleccionado (o el indicado por parámetro). */
    const loadReviews = useCallback(
        async (mediaItemId: string = selectedMediaId, nextPage: number = page.page): Promise<void> => {
            if (!mediaItemId) return;
            await dispatch(
                fetchReviewsByMediaQuery({
                    mediaItemId,
                    page: nextPage,
                    limit: page.limit,
                }),
            );
        },
        [dispatch, page.limit, page.page, selectedMediaId],
    );

    /** Cambia el elemento multimedia seleccionado y reinicia la paginación a la página 1. */
    const selectMedia = useCallback(
        (mediaItemId: string) => {
            dispatch(setSelectedMediaId(mediaItemId));
        },
        [dispatch],
    );

    /** Cambia la página actual de reseñas. */
    const changePage = useCallback(
        (nextPage: number) => {
            dispatch(setReviewsPage(nextPage));
        },
        [dispatch],
    );

    /** Recarga reseñas solo si el evento corresponde al medio seleccionado. */
    const refreshForMedia = useCallback(async (mediaItemId: string): Promise<void> => {
        if (mediaItemId !== selectedMediaId) return;
        await dispatch(fetchReviewsByMediaQuery({
            mediaItemId,
            page: page.page,
            limit: page.limit,
        }));
    }, [dispatch, page.limit, page.page, selectedMediaId]);

    /** Refleja el cambio de visibilidad recibido por Socket.IO. */
    const applyVisibilityChange = useCallback((payload: Parameters<typeof hideReviewFromSocket>[0]) => {
        dispatch(hideReviewFromSocket(payload));
    }, [dispatch]);

    /** Publica una nueva reseña sobre el elemento seleccionado y recarga el listado. */
    const create = useCallback(
        async (mediaItemId: string, draft: ReviewDraft): Promise<boolean> => {
            const action = await dispatch(createReviewMutation({ mediaItemId, draft }));
            const ok = createReviewMutation.fulfilled.match(action);
            if (ok) {
                await dispatch(
                    fetchReviewsByMediaQuery({ mediaItemId, page: 1, limit: page.limit }),
                );
            }
            return ok;
        },
        [dispatch, page.limit],
    );

    /** Edita una reseña existente y recarga el listado para reflejar los cambios del servidor. */
    const update = useCallback(
        async (id: string, changes: ReviewChanges): Promise<boolean> => {
            const action = await dispatch(updateReviewMutation({ id, changes }));
            const ok = updateReviewMutation.fulfilled.match(action);
            if (ok && selectedMediaId) {
                await dispatch(
                    fetchReviewsByMediaQuery({
                        mediaItemId: selectedMediaId,
                        page: page.page,
                        limit: page.limit,
                    }),
                );
            }
            return ok;
        },
        [dispatch, page.limit, page.page, selectedMediaId],
    );

    /** Elimina una reseña y recarga la página actual (o retrocede si quedó vacía). */
    const remove = useCallback(
        async (id: string): Promise<boolean> => {
            const action = await dispatch(deleteReviewMutation(id));
            const ok = deleteReviewMutation.fulfilled.match(action);
            if (ok && selectedMediaId) {
                const nextPage = reviews.length <= 1 && page.page > 1 ? page.page - 1 : page.page;
                await dispatch(
                    fetchReviewsByMediaQuery({
                        mediaItemId: selectedMediaId,
                        page: nextPage,
                        limit: page.limit,
                    }),
                );
            }
            return ok;
        },
        [dispatch, page.limit, page.page, reviews.length, selectedMediaId],
    );

    /** Limpia mensajes de éxito y error previos en el store. */
    const clearFeedback = useCallback(() => {
        dispatch(clearReviewsFeedback());
    }, [dispatch]);

    return {
        mediaOptions,
        isLoadingOptions: mediaOptionsStatus === 'loading',
        selectedMediaId,
        reviews,
        page,
        isLoading: status === 'loading',
        isMutating: mutationStatus === 'loading',
        errorMessage,
        successMessage,
        loadMediaOptions,
        loadReviews,
        selectMedia,
        changePage,
        refreshForMedia,
        applyVisibilityChange,
        create,
        update,
        remove,
        clearFeedback,
    };
}
