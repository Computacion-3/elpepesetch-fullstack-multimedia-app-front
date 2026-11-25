'use client';

import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import type { GenreChanges, GenreDraft } from '../../domain/entities/genre';
import {
    clearGenresError,
    createGenre,
    deleteGenre,
    fetchGenres,
    updateGenre,
} from '../store/genres.slice';
import {
    selectGenres,
    selectGenresError,
    selectGenresMutationStatus,
    selectGenresStatus,
} from '../store/genres.selectors';

/** Hook fachada de géneros para filtros, formularios y pantallas administrativas. */
export function useGenres() {
    const dispatch = useAppDispatch();
    const items = useAppSelector(selectGenres);
    const status = useAppSelector(selectGenresStatus);
    const mutationStatus = useAppSelector(selectGenresMutationStatus);
    const errorMessage = useAppSelector(selectGenresError);

    useEffect(() => {
        if (status === 'idle') dispatch(fetchGenres());
    }, [dispatch, status]);

    const reload = useCallback(async (): Promise<void> => {
        await dispatch(fetchGenres());
    }, [dispatch]);

    const create = useCallback(async (draft: GenreDraft): Promise<boolean> => {
        const succeeded = createGenre.fulfilled.match(await dispatch(createGenre(draft)));
        if (succeeded) await dispatch(fetchGenres());
        return succeeded;
    }, [dispatch]);

    const update = useCallback(async (id: string, changes: GenreChanges): Promise<boolean> => {
        const succeeded = updateGenre.fulfilled.match(await dispatch(updateGenre({ id, changes })));
        if (succeeded) await dispatch(fetchGenres());
        return succeeded;
    }, [dispatch]);

    const remove = useCallback(async (id: string): Promise<boolean> => {
        const succeeded = deleteGenre.fulfilled.match(await dispatch(deleteGenre(id)));
        if (succeeded) await dispatch(fetchGenres());
        return succeeded;
    }, [dispatch]);

    const clearError = useCallback(() => dispatch(clearGenresError()), [dispatch]);

    return {
        items, status, mutationStatus, errorMessage,
        isLoading: status === 'loading', isMutating: mutationStatus === 'loading',
        reload, create, update, remove, clearError,
    };
}
