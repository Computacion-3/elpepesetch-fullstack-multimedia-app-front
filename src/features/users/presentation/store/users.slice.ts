import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ActionResult } from '@/src/shared/domain/action-result';
import { describeError } from '@/src/shared/domain/errors';
import type { UserChanges, UserDraft, UserFilters } from '../../domain/entities/user-account';
import type {
    UsersFiltersViewModel,
    UsersPageViewModel,
    UserViewModel,
} from '../viewmodels/users.viewmodel';

/**
 * What the thunks need from the outside world, expressed with DOMAIN types only.
 * src/store/store.ts injects the real Server Actions as the thunk extraArgument.
 */
export interface UsersDependencies {
    list: (filters: UserFilters) => Promise<ActionResult<UsersPageViewModel>>;
    create: (draft: UserDraft) => Promise<ActionResult<UserViewModel>>;
    update: (id: number, changes: UserChanges) => Promise<ActionResult<UserViewModel>>;
    assignRole: (id: number, roleId: number) => Promise<ActionResult<UserViewModel>>;
    setStatus: (id: number, isActive: boolean) => Promise<ActionResult<UserViewModel>>;
    remove: (id: number) => Promise<ActionResult<null>>;
}

export type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface UsersState {
    items: UserViewModel[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    filters: UsersFiltersViewModel;
    status: RequestStatus;
    errorMessage: string | null;
}

const initialState: UsersState = {
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    filters: { page: 1, limit: 10 },
    status: 'idle',
    errorMessage: null,
};

const createAppThunk = createAsyncThunk.withTypes<{
    state: { users: UsersState };
    extra: { users: UsersDependencies };
    rejectValue: string;
}>();

/** Query: loads a page of users. */
export const fetchUsersQuery = createAppThunk(
    'users/fetch',
    async (filters: UserFilters, { extra, rejectWithValue }) => {
        try {
            const result = await extra.users.list(filters);
            if (!result.ok) return rejectWithValue(result.message);
            return result.data;
        } catch (err) {
            return rejectWithValue(describeError(err, 'No se pudieron cargar los usuarios'));
        }
    },
);

/** Mutation: creates a user (the list is reloaded by the hook). */
export const createUserMutation = createAppThunk(
    'users/create',
    async (draft: UserDraft, { extra, rejectWithValue }) => {
        try {
            const result = await extra.users.create(draft);
            if (!result.ok) return rejectWithValue(result.message);
            return result.data;
        } catch (err) {
            return rejectWithValue(describeError(err, 'No se pudo crear el usuario'));
        }
    },
);

/** Mutation: updates a user's data. */
export const updateUserMutation = createAppThunk(
    'users/update',
    async (input: { id: number; changes: UserChanges }, { extra, rejectWithValue }) => {
        try {
            const result = await extra.users.update(input.id, input.changes);
            if (!result.ok) return rejectWithValue(result.message);
            return result.data;
        } catch (err) {
            return rejectWithValue(describeError(err, 'No se pudo actualizar el usuario'));
        }
    },
);

/** Mutation: assigns a role to a user. */
export const assignUserRoleMutation = createAppThunk(
    'users/assignRole',
    async (input: { id: number; roleId: number }, { extra, rejectWithValue }) => {
        try {
            const result = await extra.users.assignRole(input.id, input.roleId);
            if (!result.ok) return rejectWithValue(result.message);
            return result.data;
        } catch (err) {
            return rejectWithValue(describeError(err, 'No se pudo asignar el rol'));
        }
    },
);

/** Mutation: activates or deactivates a user. */
export const setUserStatusMutation = createAppThunk(
    'users/setStatus',
    async (input: { id: number; isActive: boolean }, { extra, rejectWithValue }) => {
        try {
            const result = await extra.users.setStatus(input.id, input.isActive);
            if (!result.ok) return rejectWithValue(result.message);
            return result.data;
        } catch (err) {
            return rejectWithValue(describeError(err, 'No se pudo cambiar el estado del usuario'));
        }
    },
);

/** Mutation: deletes a user. */
export const deleteUserMutation = createAppThunk(
    'users/delete',
    async (id: number, { extra, rejectWithValue }) => {
        try {
            const result = await extra.users.remove(id);
            if (!result.ok) return rejectWithValue(result.message);
            return result.data;
        } catch (err) {
            return rejectWithValue(describeError(err, 'No se pudo eliminar el usuario'));
        }
    },
);

export const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        setUsersFilters: (state, action: PayloadAction<Partial<UsersFiltersViewModel>>) => {
            state.filters = { ...state.filters, page: 1, ...action.payload };
        },
        clearUsersError: (state) => {
            state.errorMessage = null;
            if (state.status === 'failed') state.status = 'idle';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsersQuery.pending, (state) => {
                state.status = 'loading';
                state.errorMessage = null;
            })
            .addCase(fetchUsersQuery.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload.items;
                state.total = action.payload.total;
                state.page = action.payload.page;
                state.limit = action.payload.limit;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(fetchUsersQuery.rejected, (state, action) => {
                state.status = 'failed';
                state.errorMessage = action.payload ?? action.error.message ?? 'Ocurrió un error';
            });

        // Mutations only track status/error; the list is reloaded from the hook.
        const mutations = [
            createUserMutation,
            updateUserMutation,
            assignUserRoleMutation,
            setUserStatusMutation,
            deleteUserMutation,
        ] as const;
        for (const mutation of mutations) {
            builder
                .addCase(mutation.pending, (state) => {
                    state.status = 'loading';
                    state.errorMessage = null;
                })
                .addCase(mutation.fulfilled, (state) => {
                    state.status = 'succeeded';
                })
                .addCase(mutation.rejected, (state, action) => {
                    state.status = 'failed';
                    state.errorMessage =
                        (action.payload as string | undefined) ??
                        action.error.message ??
                        'Ocurrió un error';
                });
        }
    },
});

export const { setUsersFilters, clearUsersError } = usersSlice.actions;
