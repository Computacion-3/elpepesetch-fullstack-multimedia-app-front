'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import type { LoginCredentials, RegisterDraft } from '../../domain/entities/user';
import {
    clearAuthError,
    hydrateUser,
    loginMutation,
    logoutMutation,
    registerMutation,
    refreshCurrentUserMutation,
} from '../store/auth.slice';
import {
    selectAuthError,
    selectAuthStatus,
    selectAuthUser,
    selectIsAuthenticated,
    selectSessionEndedReason,
} from '../store/auth.selectors';
import type { AuthUserViewModel } from '../viewmodels/auth.viewmodel';

/** Facade hook: the only place components get auth state and actions from. */
export function useAuth() {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectAuthUser);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const status = useAppSelector(selectAuthStatus);
    const errorMessage = useAppSelector(selectAuthError);
    const sessionEndedReason = useAppSelector(selectSessionEndedReason);

    const login = useCallback(
        async (credentials: LoginCredentials): Promise<boolean> =>
            loginMutation.fulfilled.match(await dispatch(loginMutation(credentials))),
        [dispatch],
    );

    const register = useCallback(
        async (draft: RegisterDraft): Promise<boolean> =>
            registerMutation.fulfilled.match(await dispatch(registerMutation(draft))),
        [dispatch],
    );

    const logout = useCallback(async (): Promise<void> => {
        await dispatch(logoutMutation());
    }, [dispatch]);

    /** Actualiza la sesión tras recibir un cambio de cuenta en tiempo real. */
    const refreshCurrentUser = useCallback(async (): Promise<boolean> => {
        const result = await dispatch(refreshCurrentUserMutation());
        return refreshCurrentUserMutation.fulfilled.match(result);
    }, [dispatch]);

    const hydrate = useCallback(
        (value: AuthUserViewModel | null) => {
            dispatch(hydrateUser(value));
        },
        [dispatch],
    );

    const hasPermission = useCallback(
        (permission: string): boolean => user?.permissions.includes(permission) ?? false,
        [user],
    );

    const clearError = useCallback(() => {
        dispatch(clearAuthError());
    }, [dispatch]);

    return {
        user,
        isAuthenticated,
        isLoading: status === 'loading',
        errorMessage,
        sessionEndedReason,
        login,
        register,
        logout,
        refreshCurrentUser,
        hydrate,
        hasPermission,
        clearError,
    };
}
