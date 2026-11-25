import { combineSlices, configureStore } from '@reduxjs/toolkit';
import type { UnknownAction } from '@reduxjs/toolkit';
// <clean:imports> — one slice import and one container import per feature (keep this marker).
import {
    getSocketTokenAction,
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
import {
    createMediaItemAction,
    getMediaItemAction,
    listMediaAction,
    listPendingMediaAction,
    setMediaItemApprovalAction,
    updateMediaItemAction,
} from '@/src/features/media/presentation/actions/media.actions';
import { mediaSlice } from '@/src/features/media/presentation/store/media.slice';
import type { MediaDependencies } from '@/src/features/media/presentation/store/media.slice';
import {
    createGenreAction,
    deleteGenreAction,
    listGenresAction,
    updateGenreAction,
} from '@/src/features/genres/presentation/actions/genres.actions';
import { genresSlice } from '@/src/features/genres/presentation/store/genres.slice';
import type { GenresDependencies } from '@/src/features/genres/presentation/store/genres.slice';

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
    mediaSlice,
    genresSlice,
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
            getSocketToken: getSocketTokenAction,
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
        media: {
            list: listMediaAction,
            listPending: listPendingMediaAction,
            getById: getMediaItemAction,
            create: createMediaItemAction,
            update: updateMediaItemAction,
            setApproval: setMediaItemApprovalAction,
        } satisfies MediaDependencies,
        genres: {
            list: listGenresAction,
            create: createGenreAction,
            update: updateGenreAction,
            remove: deleteGenreAction,
        } satisfies GenresDependencies,
    };
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
