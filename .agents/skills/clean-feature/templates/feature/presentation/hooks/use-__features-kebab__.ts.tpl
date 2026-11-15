'use client';

import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import type { Create__Feature__Params } from '../../domain/repositories/__feature-kebab__.repository';
import {
    select__Features__,
    select__Features__Error,
    select__Features__IsMutating,
    select__Features__Status,
} from '../store/__features-kebab__.selectors';
import { clear__Features__Error, create__Feature__Mutation, fetch__Features__ } from '../store/__features-kebab__.slice';

/**
 * Facade hook: the ONLY bridge between components and Redux.
 * Components never import react-redux, slices or selectors.
 */
export function use__Features__() {
    const dispatch = useAppDispatch();
    const items = useAppSelector(select__Features__);
    const status = useAppSelector(select__Features__Status);
    const isMutating = useAppSelector(select__Features__IsMutating);
    const errorMessage = useAppSelector(select__Features__Error);

    // Load once: 'idle' means never requested. An empty result ('succeeded' + []) does NOT refetch.
    useEffect(() => {
        if (status === 'idle') {
            void dispatch(fetch__Features__());
        }
    }, [dispatch, status]);

    const create__Feature__ = useCallback(
        async (params: Create__Feature__Params): Promise<boolean> => {
            const result = await dispatch(create__Feature__Mutation(params));
            return create__Feature__Mutation.fulfilled.match(result);
        },
        [dispatch],
    );

    const reload = useCallback(() => {
        void dispatch(fetch__Features__());
    }, [dispatch]);

    const clearError = useCallback(() => {
        dispatch(clear__Features__Error());
    }, [dispatch]);

    return {
        items,
        isLoading: status === 'loading',
        isMutating,
        errorMessage,
        reload,
        clearError,
        create__Feature__,
    };
}
