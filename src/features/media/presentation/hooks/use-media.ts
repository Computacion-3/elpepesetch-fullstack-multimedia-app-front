'use client';

import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import type { MediaApprovalDraft, MediaItemChanges, MediaItemDraft, MediaQuery } from '../../domain/entities/media-item';
import {
    clearMediaError,
    clearSelectedMedia,
    createMediaItem,
    fetchMedia,
    fetchMediaItem,
    fetchPendingMedia,
    setMediaApproval,
    setMediaQuery,
    updateMediaItem,
} from '../store/media.slice';
import {
    selectMediaDetailStatus,
    selectMediaError,
    selectMediaItems,
    selectMediaListStatus,
    selectMediaMeta,
    selectMediaMutationStatus,
    selectMediaQuery,
    selectPendingMedia,
    selectPendingMediaMeta,
    selectPendingMediaStatus,
    selectSelectedMedia,
} from '../store/media.selectors';

/** Hook fachada que concentra carga inicial, filtros y recarga pesimista. */
export function useMedia() {
    const dispatch = useAppDispatch();
    const items = useAppSelector(selectMediaItems);
    const selectedItem = useAppSelector(selectSelectedMedia);
    const pendingItems = useAppSelector(selectPendingMedia);
    const query = useAppSelector(selectMediaQuery);
    const meta = useAppSelector(selectMediaMeta);
    const pendingMeta = useAppSelector(selectPendingMediaMeta);
    const listStatus = useAppSelector(selectMediaListStatus);
    const detailStatus = useAppSelector(selectMediaDetailStatus);
    const pendingStatus = useAppSelector(selectPendingMediaStatus);
    const mutationStatus = useAppSelector(selectMediaMutationStatus);
    const errorMessage = useAppSelector(selectMediaError);

    useEffect(() => {
        if (listStatus === 'idle') dispatch(fetchMedia(query));
    }, [dispatch, listStatus, query]);

    const setFilters = useCallback((changes: Partial<MediaQuery>) => {
        dispatch(setMediaQuery(changes));
    }, [dispatch]);

    const reload = useCallback((nextQuery: MediaQuery = query) => {
        dispatch(fetchMedia(nextQuery));
    }, [dispatch, query]);

    const loadPending = useCallback((nextQuery: MediaQuery) => {
        dispatch(fetchPendingMedia(nextQuery));
    }, [dispatch]);

    const getById = useCallback(async (id: string): Promise<boolean> => {
        return fetchMediaItem.fulfilled.match(await dispatch(fetchMediaItem(id)));
    }, [dispatch]);

    const clearDetail = useCallback(() => dispatch(clearSelectedMedia()), [dispatch]);
    const clearError = useCallback(() => dispatch(clearMediaError()), [dispatch]);

    const propose = useCallback(async (draft: MediaItemDraft): Promise<boolean> => {
        const succeeded = createMediaItem.fulfilled.match(await dispatch(createMediaItem(draft)));
        if (succeeded) await dispatch(fetchMedia(query));
        return succeeded;
    }, [dispatch, query]);

    const updateProposal = useCallback(async (id: string, changes: MediaItemChanges): Promise<boolean> => {
        const succeeded = updateMediaItem.fulfilled.match(await dispatch(updateMediaItem({ id, changes })));
        if (succeeded) {
            await dispatch(fetchMedia(query));
            await dispatch(fetchMediaItem(id));
        }
        return succeeded;
    }, [dispatch, query]);

    const decide = useCallback(async (
        id: string,
        decision: MediaApprovalDraft,
        pendingQuery: MediaQuery = query,
    ): Promise<boolean> => {
        const succeeded = setMediaApproval.fulfilled.match(await dispatch(setMediaApproval({ id, decision })));
        if (succeeded) {
            await dispatch(fetchPendingMedia(pendingQuery));
            await dispatch(fetchMedia(query));
        }
        return succeeded;
    }, [dispatch, query]);

    return {
        items, selectedItem, pendingItems, query, meta, pendingMeta,
        listStatus, detailStatus, pendingStatus, mutationStatus, errorMessage,
        isLoading: listStatus === 'loading', isMutating: mutationStatus === 'loading',
        setFilters, reload, loadPending, getById, clearDetail, propose, updateProposal, decide, clearError,
    };
}
