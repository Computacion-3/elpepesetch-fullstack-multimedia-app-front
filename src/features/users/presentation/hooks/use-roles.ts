'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import type { RoleDraft } from '../../domain/entities/role';
import {
    clearRolesError,
    clearSelectedRole,
    createRoleMutation,
    deleteRoleMutation,
    fetchRoleQuery,
    fetchRolesQuery,
    setRolePermissionsMutation,
    updateRoleMutation,
} from '../store/roles.slice';
import {
    selectRoles,
    selectRolesError,
    selectRolesStatus,
    selectSelectedRole,
} from '../store/roles.selectors';

/** Facade hook: the only place components get roles state and actions from. */
export function useRoles() {
    const dispatch = useAppDispatch();
    const roles = useAppSelector(selectRoles);
    const selectedRole = useAppSelector(selectSelectedRole);
    const status = useAppSelector(selectRolesStatus);
    const errorMessage = useAppSelector(selectRolesError);

    const load = useCallback(async (): Promise<void> => {
        await dispatch(fetchRolesQuery());
    }, [dispatch]);

    const loadRole = useCallback(
        async (id: number): Promise<void> => {
            await dispatch(fetchRoleQuery(id));
        },
        [dispatch],
    );

    const create = useCallback(
        async (draft: RoleDraft): Promise<boolean> => {
            const ok = createRoleMutation.fulfilled.match(await dispatch(createRoleMutation(draft)));
            if (ok) await dispatch(fetchRolesQuery());
            return ok;
        },
        [dispatch],
    );

    const update = useCallback(
        async (id: number, draft: RoleDraft): Promise<boolean> => {
            const ok = updateRoleMutation.fulfilled.match(
                await dispatch(updateRoleMutation({ id, draft })),
            );
            if (ok) await dispatch(fetchRolesQuery());
            return ok;
        },
        [dispatch],
    );

    const setPermissions = useCallback(
        async (id: number, permissionIds: number[]): Promise<boolean> => {
            const ok = setRolePermissionsMutation.fulfilled.match(
                await dispatch(setRolePermissionsMutation({ id, permissionIds })),
            );
            if (ok) await dispatch(fetchRolesQuery());
            return ok;
        },
        [dispatch],
    );

    const remove = useCallback(
        async (id: number): Promise<boolean> => {
            const ok = deleteRoleMutation.fulfilled.match(await dispatch(deleteRoleMutation(id)));
            if (ok) await dispatch(fetchRolesQuery());
            return ok;
        },
        [dispatch],
    );

    const clearSelected = useCallback(() => {
        dispatch(clearSelectedRole());
    }, [dispatch]);

    const clearError = useCallback(() => {
        dispatch(clearRolesError());
    }, [dispatch]);

    return {
        roles,
        selectedRole,
        isLoading: status === 'loading',
        errorMessage,
        load,
        loadRole,
        create,
        update,
        setPermissions,
        remove,
        clearSelected,
        clearError,
    };
}
