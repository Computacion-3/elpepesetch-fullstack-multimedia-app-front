import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { ActionResult } from '@/src/shared/domain/action-result';
import { describeError } from '@/src/shared/domain/errors';
import type { PermissionDraft } from '../../domain/entities/permission';
import type { PermissionViewModel } from '../viewmodels/permissions.viewmodel';

/**
 * What the thunks need from the outside world, expressed with DOMAIN types only.
 * src/store/store.ts injects the real Server Actions as the thunk extraArgument.
 */
export interface PermissionsDependencies {
    list: () => Promise<ActionResult<PermissionViewModel[]>>;
    create: (draft: PermissionDraft) => Promise<ActionResult<PermissionViewModel>>;
    update: (id: number, draft: PermissionDraft) => Promise<ActionResult<PermissionViewModel>>;
    remove: (id: number) => Promise<ActionResult<null>>;
}

export type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface PermissionsState {
    items: PermissionViewModel[];
    status: RequestStatus;
    errorMessage: string | null;
}

const initialState: PermissionsState = {
    items: [],
    status: 'idle',
    errorMessage: null,
};

const createAppThunk = createAsyncThunk.withTypes<{
    state: { permissions: PermissionsState };
    extra: { permissions: PermissionsDependencies };
    rejectValue: string;
}>();

/** Query: loads the permissions list. */
export const fetchPermissionsQuery = createAppThunk(
    'permissions/fetch',
    async (_: void, { extra, rejectWithValue }) => {
        try {
            const result = await extra.permissions.list();
            if (!result.ok) return rejectWithValue(result.message);
            return result.data;
        } catch (err) {
            return rejectWithValue(describeError(err, 'No se pudieron cargar los permisos'));
        }
    },
);

/** Mutation: creates a permission (the hook reloads the list afterwards). */
export const createPermissionMutation = createAppThunk(
    'permissions/create',
    async (draft: PermissionDraft, { extra, rejectWithValue }) => {
        try {
            const result = await extra.permissions.create(draft);
            if (!result.ok) return rejectWithValue(result.message);
            return result.data;
        } catch (err) {
            return rejectWithValue(describeError(err, 'No se pudo crear el permiso'));
        }
    },
);

/** Mutation: updates a permission (the hook reloads the list afterwards). */
export const updatePermissionMutation = createAppThunk(
    'permissions/update',
    async (input: { id: number; draft: PermissionDraft }, { extra, rejectWithValue }) => {
        try {
            const result = await extra.permissions.update(input.id, input.draft);
            if (!result.ok) return rejectWithValue(result.message);
            return result.data;
        } catch (err) {
            return rejectWithValue(describeError(err, 'No se pudo actualizar el permiso'));
        }
    },
);

/** Mutation: deletes a permission (the hook reloads the list afterwards). */
export const deletePermissionMutation = createAppThunk(
    'permissions/delete',
    async (id: number, { extra, rejectWithValue }) => {
        try {
            const result = await extra.permissions.remove(id);
            if (!result.ok) return rejectWithValue(result.message);
            return result.data;
        } catch (err) {
            return rejectWithValue(describeError(err, 'No se pudo eliminar el permiso'));
        }
    },
);

export const permissionsSlice = createSlice({
    name: 'permissions',
    initialState,
    reducers: {
        clearError: (state) => {
            state.errorMessage = null;
            if (state.status === 'failed') state.status = 'idle';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPermissionsQuery.pending, (state) => {
                state.status = 'loading';
                state.errorMessage = null;
            })
            .addCase(fetchPermissionsQuery.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchPermissionsQuery.rejected, (state, action) => {
                state.status = 'failed';
                state.errorMessage = action.payload ?? action.error.message ?? 'Ocurrió un error';
            });

        for (const thunk of [
            createPermissionMutation,
            updatePermissionMutation,
            deletePermissionMutation,
        ]) {
            builder
                .addCase(thunk.pending, (state) => {
                    state.status = 'loading';
                    state.errorMessage = null;
                })
                .addCase(thunk.fulfilled, (state) => {
                    state.status = 'succeeded';
                })
                .addCase(thunk.rejected, (state, action) => {
                    state.status = 'failed';
                    state.errorMessage =
                        (action.payload as string | undefined) ?? action.error.message ?? 'Ocurrió un error';
                });
        }
    },
});

export const { clearError: clearPermissionsError } = permissionsSlice.actions;
