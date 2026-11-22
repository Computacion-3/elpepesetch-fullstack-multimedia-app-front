import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { describeError } from '@/src/shared/domain/errors';
import type { LoginCredentials, RegisterDraft } from '../../domain/entities/user';
import type { AuthUserViewModel } from '../viewmodels/auth.viewmodel';

/** Structurally identical to ActionResult (src/shared): pres-store may not import `shared` per the lint config. */
type ActionResult<T> = { ok: true; data: T } | { ok: false; message: string };

/**
 * What the thunks need from the outside world, expressed with DOMAIN types only.
 * src/store/store.ts injects the real Server Actions as the thunk extraArgument.
 */
export interface AuthDependencies {
    login: (input: LoginCredentials) => Promise<ActionResult<AuthUserViewModel>>;
    register: (draft: RegisterDraft) => Promise<ActionResult<null>>;
    logout: () => Promise<void>;
}

export type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface AuthState {
    user: AuthUserViewModel | null;
    status: RequestStatus;
    errorMessage: string | null;
}

const initialState: AuthState = {
    user: null,
    status: 'idle',
    errorMessage: null,
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
    },
});

export const { hydrateUser, clearError: clearAuthError } = authSlice.actions;
