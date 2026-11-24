import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { ActionResult } from '@/src/shared/domain/action-result';
import { describeError } from '@/src/shared/domain/errors';
import type { RoleDraft } from '../../domain/entities/role';
import type { RoleViewModel } from '../viewmodels/roles.viewmodel';

/**
 * What the thunks need from the outside world, expressed with DOMAIN types only.
 * src/store/store.ts injects the real Server Actions as the thunk extraArgument.
 */
export interface RolesDependencies {
    list: () => Promise<ActionResult<RoleViewModel[]>>;
    get: (id: number) => Promise<ActionResult<RoleViewModel>>;
    create: (draft: RoleDraft) => Promise<ActionResult<RoleViewModel>>;
    update: (id: number, draft: RoleDraft) => Promise<ActionResult<RoleViewModel>>;
    setPermissions: (id: number, permissionIds: number[]) => Promise<ActionResult<RoleViewModel>>;
    remove: (id: number) => Promise<ActionResult<null>>;
}

export type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface RolesState {
    items: RoleViewModel[];
    selected: RoleViewModel | null;
    status: RequestStatus;
    errorMessage: string | null;
}

const initialState: RolesState = {
    items: [],
    selected: null,
    status: 'idle',
    errorMessage: null,
};

const createAppThunk = createAsyncThunk.withTypes<{
    state: { roles: RolesState };
    extra: { roles: RolesDependencies };
    rejectValue: string;
}>();

/** Query: loads the roles list. */
export const fetchRolesQuery = createAppThunk(
    'roles/fetchList',
    async (_: void, { extra, rejectWithValue }) => {
        try {
            const result = await extra.roles.list();
            if (!result.ok) return rejectWithValue(result.message);
            return result.data;
        } catch (err) {
            return rejectWithValue(describeError(err, 'No se pudieron cargar los roles'));
        }
    },
);

/** Query: loads one role. */
export const fetchRoleQuery = createAppThunk(
    'roles/fetchOne',
    async (id: number, { extra, rejectWithValue }) => {
        try {
            const result = await extra.roles.get(id);
            if (!result.ok) return rejectWithValue(result.message);
            return result.data;
        } catch (err) {
            return rejectWithValue(describeError(err, 'No se pudo cargar el rol'));
        }
    },
);

/** Mutation: creates a role (the hook reloads the list). */
export const createRoleMutation = createAppThunk(
    'roles/create',
    async (draft: RoleDraft, { extra, rejectWithValue }) => {
        try {
            const result = await extra.roles.create(draft);
            if (!result.ok) return rejectWithValue(result.message);
            return result.data;
        } catch (err) {
            return rejectWithValue(describeError(err, 'No se pudo crear el rol'));
        }
    },
);

/** Mutation: updates a role (the hook reloads the list). */
export const updateRoleMutation = createAppThunk(
    'roles/update',
    async (input: { id: number; draft: RoleDraft }, { extra, rejectWithValue }) => {
        try {
            const result = await extra.roles.update(input.id, input.draft);
            if (!result.ok) return rejectWithValue(result.message);
            return result.data;
        } catch (err) {
            return rejectWithValue(describeError(err, 'No se pudo actualizar el rol'));
        }
    },
);

/** Mutation: replaces the permissions of a role. */
export const setRolePermissionsMutation = createAppThunk(
    'roles/setPermissions',
    async (input: { id: number; permissionIds: number[] }, { extra, rejectWithValue }) => {
        try {
            const result = await extra.roles.setPermissions(input.id, input.permissionIds);
            if (!result.ok) return rejectWithValue(result.message);
            return result.data;
        } catch (err) {
            return rejectWithValue(describeError(err, 'No se pudieron asignar los permisos'));
        }
    },
);

/** Mutation: deletes a role (the hook reloads the list). */
export const deleteRoleMutation = createAppThunk(
    'roles/delete',
    async (id: number, { extra, rejectWithValue }) => {
        try {
            const result = await extra.roles.remove(id);
            if (!result.ok) return rejectWithValue(result.message);
            return result.data;
        } catch (err) {
            return rejectWithValue(describeError(err, 'No se pudo eliminar el rol'));
        }
    },
);

export const rolesSlice = createSlice({
    name: 'roles',
    initialState,
    reducers: {
        clearSelectedRole: (state) => {
            state.selected = null;
        },
        clearRolesError: (state) => {
            state.errorMessage = null;
            if (state.status === 'failed') state.status = 'idle';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRolesQuery.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchRoleQuery.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.selected = action.payload;
            })
            .addCase(setRolePermissionsMutation.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.selected = action.payload;
            })
            .addCase(createRoleMutation.fulfilled, (state) => {
                state.status = 'succeeded';
            })
            .addCase(updateRoleMutation.fulfilled, (state) => {
                state.status = 'succeeded';
            })
            .addCase(deleteRoleMutation.fulfilled, (state) => {
                state.status = 'succeeded';
            });

        const thunks = [
            fetchRolesQuery,
            fetchRoleQuery,
            createRoleMutation,
            updateRoleMutation,
            setRolePermissionsMutation,
            deleteRoleMutation,
        ] as const;
        for (const thunk of thunks) {
            builder
                .addCase(thunk.pending, (state) => {
                    state.status = 'loading';
                    state.errorMessage = null;
                })
                .addCase(thunk.rejected, (state, action) => {
                    state.status = 'failed';
                    state.errorMessage =
                        (action.payload as string | undefined) ??
                        action.error.message ??
                        'Ocurrió un error';
                });
        }
    },
});

export const { clearSelectedRole, clearRolesError } = rolesSlice.actions;
