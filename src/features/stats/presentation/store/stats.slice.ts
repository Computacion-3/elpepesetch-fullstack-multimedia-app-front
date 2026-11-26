import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { ActionResult } from '@/src/shared/domain/action-result';
import { describeError } from '@/src/shared/domain/errors';
import type {
    GlobalStatsViewModel,
    PersonalStatsViewModel,
} from '../viewmodels/stats.viewmodel';

/**
 * Contrato de dependencias inyectadas por el store para los thunks de `stats`.
 */
export interface StatsDependencies {
    getPersonal: () => Promise<ActionResult<PersonalStatsViewModel>>;
    getGlobal: () => Promise<ActionResult<GlobalStatsViewModel>>;
}

export type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

/** Estado global de Redux para estadísticas personales y globales. */
export interface StatsState {
    personal: PersonalStatsViewModel | null;
    global: GlobalStatsViewModel | null;
    personalStatus: RequestStatus;
    globalStatus: RequestStatus;
    personalError: string | null;
    globalError: string | null;
}

const initialState: StatsState = {
    personal: null,
    global: null,
    personalStatus: 'idle',
    globalStatus: 'idle',
    personalError: null,
    globalError: null,
};

const createAppThunk = createAsyncThunk.withTypes<{
    state: { stats: StatsState };
    extra: { stats: StatsDependencies };
    rejectValue: string;
}>();

/** Query: carga las estadísticas personales del usuario autenticado. */
export const fetchPersonalStatsQuery = createAppThunk(
    'stats/fetchPersonal',
    async (_, { extra, rejectWithValue }) => {
        try {
            const result = await extra.stats.getPersonal();
            if (!result.ok) return rejectWithValue(result.message);
            return result.data;
        } catch (err) {
            return rejectWithValue(
                describeError(err, 'No se pudieron cargar tus estadísticas personales'),
            );
        }
    },
);

/** Query: carga las estadísticas globales de la plataforma (solo administradores). */
export const fetchGlobalStatsQuery = createAppThunk(
    'stats/fetchGlobal',
    async (_, { extra, rejectWithValue }) => {
        try {
            const result = await extra.stats.getGlobal();
            if (!result.ok) return rejectWithValue(result.message);
            return result.data;
        } catch (err) {
            return rejectWithValue(
                describeError(err, 'No se pudieron cargar las estadísticas globales'),
            );
        }
    },
);

/**
 * Slice de Redux Toolkit para el módulo `stats`.
 */
export const statsSlice = createSlice({
    name: 'stats',
    initialState,
    reducers: {
        clearStatsErrors: (state) => {
            state.personalError = null;
            state.globalError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPersonalStatsQuery.pending, (state) => {
                state.personalStatus = 'loading';
                state.personalError = null;
            })
            .addCase(fetchPersonalStatsQuery.fulfilled, (state, action) => {
                state.personalStatus = 'succeeded';
                state.personal = action.payload;
            })
            .addCase(fetchPersonalStatsQuery.rejected, (state, action) => {
                state.personalStatus = 'failed';
                state.personalError =
                    action.payload ??
                    action.error.message ??
                    'No se pudieron cargar tus estadísticas personales';
            })
            .addCase(fetchGlobalStatsQuery.pending, (state) => {
                state.globalStatus = 'loading';
                state.globalError = null;
            })
            .addCase(fetchGlobalStatsQuery.fulfilled, (state, action) => {
                state.globalStatus = 'succeeded';
                state.global = action.payload;
            })
            .addCase(fetchGlobalStatsQuery.rejected, (state, action) => {
                state.globalStatus = 'failed';
                state.globalError =
                    action.payload ??
                    action.error.message ??
                    'No se pudieron cargar las estadísticas globales';
            });
    },
});

export const { clearStatsErrors } = statsSlice.actions;
