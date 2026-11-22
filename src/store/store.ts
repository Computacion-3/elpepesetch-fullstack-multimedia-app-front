import { combineSlices, configureStore } from '@reduxjs/toolkit';
import type { UnknownAction } from '@reduxjs/toolkit';
// <clean:imports> — one slice import and one container import per feature (keep this marker).
import {
    loginAction,
    logoutAction,
    registerAction,
} from '@/src/features/auth/presentation/actions/auth.actions';
import { authSlice, logoutMutation } from '@/src/features/auth/presentation/store/auth.slice';
import type { AuthDependencies } from '@/src/features/auth/presentation/store/auth.slice';
import {
    createPermissionAction,
    deletePermissionAction,
    listPermissionsAction,
    updatePermissionAction,
} from '@/src/features/users/presentation/actions/permissions.actions';
import {
    createRoleAction,
    deleteRoleAction,
    getRoleAction,
    listRolesAction,
    setRolePermissionsAction,
    updateRoleAction,
} from '@/src/features/users/presentation/actions/roles.actions';
import {
    assignUserRoleAction,
    createUserAction,
    deleteUserAction,
    listUsersAction,
    setUserStatusAction,
    updateUserAction,
} from '@/src/features/users/presentation/actions/users.actions';
import { permissionsSlice } from '@/src/features/users/presentation/store/permissions.slice';
import type { PermissionsDependencies } from '@/src/features/users/presentation/store/permissions.slice';
import { rolesSlice } from '@/src/features/users/presentation/store/roles.slice';
import type { RolesDependencies } from '@/src/features/users/presentation/store/roles.slice';
import { usersSlice } from '@/src/features/users/presentation/store/users.slice';
import type { UsersDependencies } from '@/src/features/users/presentation/store/users.slice';

/**
 * Global store: combines feature slices and injects feature use cases as the thunk extraArgument.
 * This and the feature di/ folders are the only places that know concrete implementations.
 */
const appReducer = combineSlices(
    // <clean:slices> — e.g. routinesSlice,
    authSlice,
    usersSlice,
    rolesSlice,
    permissionsSlice,
);

/** Resets ALL slices to their initial state when logout succeeds, so no user data survives it. */
const rootReducer = (state: ReturnType<typeof appReducer> | undefined, action: UnknownAction) =>
    appReducer(logoutMutation.fulfilled.match(action) ? undefined : state, action);

function createThunkExtra() {
    return {
        // <clean:extra> — e.g. routines: createRoutineContainer(),
        // Server Actions are injected; the server-only container is never imported here.
        auth: {
            login: loginAction,
            register: registerAction,
            logout: logoutAction,
        } satisfies AuthDependencies,
        users: {
            list: listUsersAction,
            create: createUserAction,
            update: updateUserAction,
            assignRole: assignUserRoleAction,
            setStatus: setUserStatusAction,
            remove: deleteUserAction,
        } satisfies UsersDependencies,
        roles: {
            list: listRolesAction,
            get: getRoleAction,
            create: createRoleAction,
            update: updateRoleAction,
            setPermissions: setRolePermissionsAction,
            remove: deleteRoleAction,
        } satisfies RolesDependencies,
        permissions: {
            list: listPermissionsAction,
            create: createPermissionAction,
            update: updatePermissionAction,
            remove: deletePermissionAction,
        } satisfies PermissionsDependencies,
    };
    // Add `satisfies { routines: RoutinesDependencies; ... }` once features exist, so TS checks the wiring.
}

/**
 * Factory instead of a module singleton: on the server a global store would leak state
 * between concurrent requests. StoreProvider creates exactly one per client.
 */
export const makeStore = () =>
    configureStore({
        reducer: rootReducer,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({ thunk: { extraArgument: createThunkExtra() } }),
    });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<typeof appReducer>;
export type AppDispatch = AppStore['dispatch'];
