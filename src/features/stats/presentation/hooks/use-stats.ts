'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import {
    clearStatsErrors,
    fetchGlobalStatsQuery,
    fetchPersonalStatsQuery,
} from '../store/stats.slice';
import {
    selectGlobalStats,
    selectGlobalStatsError,
    selectGlobalStatsStatus,
    selectPersonalStats,
    selectPersonalStatsError,
    selectPersonalStatsStatus,
} from '../store/stats.selectors';

/**
 * Hook fachada del módulo `stats`.
 * Provee a los componentes las métricas personales y globales junto con sus acciones de recarga.
 */
export function useStats() {
    const dispatch = useAppDispatch();
    const personal = useAppSelector(selectPersonalStats);
    const global = useAppSelector(selectGlobalStats);
    const personalStatus = useAppSelector(selectPersonalStatsStatus);
    const globalStatus = useAppSelector(selectGlobalStatsStatus);
    const personalError = useAppSelector(selectPersonalStatsError);
    const globalError = useAppSelector(selectGlobalStatsError);

    /** Consulta o recarga las estadísticas personales del usuario autenticado. */
    const loadPersonal = useCallback(async (): Promise<void> => {
        await dispatch(fetchPersonalStatsQuery());
    }, [dispatch]);

    /** Consulta o recarga las estadísticas globales (solo si el usuario tiene permiso). */
    const loadGlobal = useCallback(async (): Promise<void> => {
        await dispatch(fetchGlobalStatsQuery());
    }, [dispatch]);

    /** Limpia mensajes de error de estadísticas. */
    const clearErrors = useCallback(() => {
        dispatch(clearStatsErrors());
    }, [dispatch]);

    return {
        personal,
        global,
        isLoadingPersonal: personalStatus === 'loading',
        isLoadingGlobal: globalStatus === 'loading',
        personalError,
        globalError,
        loadPersonal,
        loadGlobal,
        clearErrors,
    };
}
