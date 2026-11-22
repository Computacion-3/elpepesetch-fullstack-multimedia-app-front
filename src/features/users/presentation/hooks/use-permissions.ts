'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import type { PermissionDraft } from '../../domain/entities/permission';
import {
    clearPermissionsError,
    createPermissionMutation,
    deletePermissionMutation,
    fetchPermissionsQuery,
    updatePermissionMutation,
} from '../store/permissions.slice';
import {
    selectPermissions,
    selectPermissionsError,
    selectPermissionsStatus,
} from '../store/permissions.selectors';

/** Facade hook: the only place components get permissions state and actions from. */
export function usePermissions() {
    const dispatch = useAppDispatch();
    const permissions = useAppSelector(selectPermissions);
    const status = useAppSelector(selectPermissionsStatus);
    const errorMessage = useAppSelector(selectPermissionsError);

    const load = useCallback(async (): Promise<void> => {
        await dispatch(fetchPermissionsQuery());
    }, [dispatch]);

    const create = useCallback(
        async (draft: PermissionDraft): Promise<boolean> => {
            const ok = createPermissionMutation.fulfilled.match(
                await dispatch(createPermissionMutation(draft)),
            );
            if (ok) await dispatch(fetchPermissionsQuery());
            return ok;
        },
        [dispatch],
    );

    const update = useCallback(
        async (id: number, draft: PermissionDraft): Promise<boolean> => {
            const ok = updatePermissionMutation.fulfilled.match(
                await dispatch(updatePermissionMutation({ id, draft })),
            );
            if (ok) await dispatch(fetchPermissionsQuery());
            return ok;
        },
        [dispatch],
    );

    const remove = useCallback(
        async (id: number): Promise<boolean> => {
            const ok = deletePermissionMutation.fulfilled.match(
                await dispatch(deletePermissionMutation(id)),
            );
            if (ok) await dispatch(fetchPermissionsQuery());
            return ok;
        },
        [dispatch],
    );

    const clearError = useCallback(() => {
        dispatch(clearPermissionsError());
    }, [dispatch]);

    return {
        permissions,
        isLoading: status === 'loading',
        errorMessage,
        load,
        create,
        update,
        remove,
        clearError,
    };
}
