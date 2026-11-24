'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import type { UserChanges, UserDraft } from '../../domain/entities/user-account';
import {
    assignUserRoleMutation,
    clearUsersError,
    createUserMutation,
    deleteUserMutation,
    fetchUsersQuery,
    setUserStatusMutation,
    setUsersFilters,
    updateUserMutation,
} from '../store/users.slice';
import {
    selectUsers,
    selectUsersError,
    selectUsersFilters,
    selectUsersPage,
    selectUsersStatus,
} from '../store/users.selectors';
import type { UsersFiltersViewModel } from '../viewmodels/users.viewmodel';

/** Facade hook: the only place components get users state and actions from. */
export function useUsers() {
    const dispatch = useAppDispatch();
    const users = useAppSelector(selectUsers);
    const page = useAppSelector(selectUsersPage);
    const filters = useAppSelector(selectUsersFilters);
    const status = useAppSelector(selectUsersStatus);
    const errorMessage = useAppSelector(selectUsersError);

    const load = useCallback(async (): Promise<void> => {
        await dispatch(fetchUsersQuery(filters));
    }, [dispatch, filters]);

    const setFilters = useCallback(
        (partial: Partial<UsersFiltersViewModel>) => {
            dispatch(setUsersFilters(partial));
        },
        [dispatch],
    );

    const create = useCallback(
        async (draft: UserDraft): Promise<boolean> => {
            const ok = createUserMutation.fulfilled.match(await dispatch(createUserMutation(draft)));
            if (ok) await dispatch(fetchUsersQuery(filters));
            return ok;
        },
        [dispatch, filters],
    );

    const update = useCallback(
        async (id: number, changes: UserChanges): Promise<boolean> => {
            const ok = updateUserMutation.fulfilled.match(
                await dispatch(updateUserMutation({ id, changes })),
            );
            if (ok) await dispatch(fetchUsersQuery(filters));
            return ok;
        },
        [dispatch, filters],
    );

    const assignRole = useCallback(
        async (id: number, roleId: number): Promise<boolean> => {
            const ok = assignUserRoleMutation.fulfilled.match(
                await dispatch(assignUserRoleMutation({ id, roleId })),
            );
            if (ok) await dispatch(fetchUsersQuery(filters));
            return ok;
        },
        [dispatch, filters],
    );

    const setStatus = useCallback(
        async (id: number, isActive: boolean): Promise<boolean> => {
            const ok = setUserStatusMutation.fulfilled.match(
                await dispatch(setUserStatusMutation({ id, isActive })),
            );
            if (ok) await dispatch(fetchUsersQuery(filters));
            return ok;
        },
        [dispatch, filters],
    );

    const remove = useCallback(
        async (id: number): Promise<boolean> => {
            const ok = deleteUserMutation.fulfilled.match(await dispatch(deleteUserMutation(id)));
            if (ok) await dispatch(fetchUsersQuery(filters));
            return ok;
        },
        [dispatch, filters],
    );

    const clearError = useCallback(() => {
        dispatch(clearUsersError());
    }, [dispatch]);

    return {
        users,
        page,
        filters,
        isLoading: status === 'loading',
        errorMessage,
        load,
        setFilters,
        create,
        update,
        assignRole,
        setStatus,
        remove,
        clearError,
    };
}
