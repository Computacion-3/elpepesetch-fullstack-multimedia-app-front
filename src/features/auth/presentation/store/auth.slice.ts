import { createAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ActionResult } from '@/src/shared/domain/action-result';
import { describeError } from '@/src/shared/domain/errors';
import type { SocketTicket } from '../../domain/entities/socket-ticket';
import type { LoginCredentials, RegisterDraft } from '../../domain/entities/user';
import type { AuthUserViewModel } from '../viewmodels/auth.viewmodel';

/**
 * What the thunks need from the outside world, expressed with DOMAIN types only.
 * src/store/store.ts injects the real Server Actions as the thunk extraArgument.
 */
export interface AuthDependencies {
    login: (input: LoginCredentials) => Promise<ActionResult<AuthUserViewModel>>;
    register: (draft: RegisterDraft) => Promise<ActionResult<null>>;
    logout: () => Promise<void>;
    /** Ticket del WebSocket. Lo usa el módulo de tiempo real (P3) desde sus thunks: `extra.auth.getSocketToken()`. */
    getSocketToken: () => Promise<ActionResult<SocketTicket>>;
    refreshCurrentUser: () => Promise<ActionResult<AuthUserViewModel>>;
    expireSession: () => Promise<void>;
}

export type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface AuthState {
    user: AuthUserViewModel | null;
    status: RequestStatus;
    errorMessage: string | null;
    sessionEndedReason: 'account-deactivated' | null;
}

const initialState: AuthState = {
    user: null,
    status: 'idle',
    errorMessage: null,
    sessionEndedReason: null,
};

const createAppThunk = createAsyncThunk.withTypes<{
    state: { auth: AuthState };
    extra: { auth: AuthDependencies };
    rejectValue: string;
}>();

/** Mutation: logs in; the user is stored only after the action succeeds. */
export const loginMutation = createAppThunk(
    'auth/login',
    async (input: LoginCredentials, { extra, rejectWithValue }) => {
        try {
            const result = await extra.auth.login(input);
            if (!result.ok) return rejectWithValue(result.message);
            return result.data;
        } catch (err) {
            return rejectWithValue(describeError(err, 'No se pudo iniciar sesión'));
        }
    },
);

/** Mutation: creates an account (does not log in). */
export const registerMutation = createAppThunk(
    'auth/register',
    async (draft: RegisterDraft, { extra, rejectWithValue }) => {
        try {
            const result = await extra.auth.register(draft);
            if (!result.ok) return rejectWithValue(result.message);
            return result.data;
        } catch (err) {
            return rejectWithValue(describeError(err, 'No se pudo crear la cuenta'));
        }
    },
);

/** Mutation: logs out. The store root reducer resets all state when this is fulfilled. */
export const logoutMutation = createAppThunk(
    'auth/logout',
    async (_: void, { extra, rejectWithValue }) => {
        try {
            await extra.auth.logout();
        } catch (err) {
            return rejectWithValue(describeError(err, 'No se pudo cerrar la sesión'));
        }
    },
);

/** Sincroniza el rol y los permisos tras recibir account.updated. */
export const refreshCurrentUserMutation = createAppThunk(
    'auth/refreshCurrentUser',
    async (_: void, { extra, rejectWithValue }) => {
        try {
            const result = await extra.auth.refreshCurrentUser();
            if (!result.ok) return rejectWithValue(result.message);
            return result.data;
        } catch (error) {
            return rejectWithValue(describeError(error, 'No se pudo actualizar tu perfil'));
        }
    },
);

/** Limpia la sesión local cuando el backend informa que la cuenta fue desactivada. */
export const forceLogoutMutation = createAppThunk(
    'auth/forceLogout',
    async (_: void, { extra, rejectWithValue }) => {
        try {
            await extra.auth.expireSession();
        } catch (error) {
            return rejectWithValue(describeError(error, 'No se pudo cerrar la sesión'));
        }
    },
);

/** Acción síncrona que vacía todo el store cuando la cuenta fue desactivada. */
export const accountSessionEnded = createAction<'account-deactivated'>('auth/accountSessionEnded');

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        hydrateUser: (state, action: PayloadAction<AuthUserViewModel | null>) => {
            state.user = action.payload;
        },
        clearError: (state) => {
            state.errorMessage = null;
            if (state.status === 'failed') state.status = 'idle';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginMutation.pending, (state) => {
                state.status = 'loading';
                state.errorMessage = null;
            })
            .addCase(loginMutation.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.user = action.payload;
                state.sessionEndedReason = null;
            })
            .addCase(loginMutation.rejected, (state, action) => {
                state.status = 'failed';
                state.errorMessage = action.payload ?? action.error.message ?? 'Ocurrió un error';
            });

        builder
            .addCase(registerMutation.pending, (state) => {
                state.status = 'loading';
                state.errorMessage = null;
            })
            .addCase(registerMutation.fulfilled, (state) => {
                state.status = 'succeeded';
            })
            .addCase(registerMutation.rejected, (state, action) => {
                state.status = 'failed';
                state.errorMessage = action.payload ?? action.error.message ?? 'Ocurrió un error';
            });

        builder
            .addCase(logoutMutation.pending, (state) => {
                state.status = 'loading';
                state.errorMessage = null;
            })
            .addCase(logoutMutation.rejected, (state, action) => {
                state.status = 'failed';
                state.errorMessage = action.payload ?? action.error.message ?? 'Ocurrió un error';
            });

        builder.addCase(refreshCurrentUserMutation.fulfilled, (state, action) => {
            state.user = action.payload;
        });
        builder.addCase(accountSessionEnded, (state, action) => {
            state.user = null;
            state.sessionEndedReason = action.payload;
        });
    },
});

export const { hydrateUser, clearError: clearAuthError } = authSlice.actions;
