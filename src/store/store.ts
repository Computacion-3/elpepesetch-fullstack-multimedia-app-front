import { combineSlices, configureStore } from '@reduxjs/toolkit';
import type { UnknownAction } from '@reduxjs/toolkit';
// <clean:imports> — one slice import and one container import per feature (keep this marker).
import {
    getSocketTokenAction,
    loginAction,
    logoutAction,
    registerAction,
    refreshCurrentUserAction,
    expireSessionAction,
} from '@/src/features/auth/presentation/actions/auth.actions';
import { accountSessionEnded, authSlice, forceLogoutMutation, logoutMutation } from '@/src/features/auth/presentation/store/auth.slice';
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
import {
    addLibraryEntryAction,
    getLibraryEntryAction,
    getLibraryMediaOptionsAction,
    listLibraryAction,
    removeLibraryEntryAction,
    updateLibraryEntryAction,
} from '@/src/features/library/presentation/actions/library.actions';
import { librarySlice } from '@/src/features/library/presentation/store/library.slice';
import type { LibraryDependencies } from '@/src/features/library/presentation/store/library.slice';
import { listNotificationsAction, markNotificationReadAction } from '@/src/features/notifications/presentation/actions/notifications.actions';
import { notificationsSlice } from '@/src/features/notifications/presentation/store/notifications.slice';
import type { NotificationsDependencies } from '@/src/features/notifications/presentation/store/notifications.slice';
import { createRealtimeContainer } from '@/src/features/realtime/infrastructure/repositories/realtime.container';
import { realtimeSlice } from '@/src/features/realtime/presentation/store/realtime.slice';
import type { RealtimeDependencies } from '@/src/features/realtime/presentation/store/realtime.slice';
import { createReviewAction, listReviewsAction } from '@/src/features/reviews/presentation/actions/reviews.actions';
import { reviewsSlice } from '@/src/features/reviews/presentation/store/reviews.slice';
import type { ReviewsDependencies } from '@/src/features/reviews/presentation/store/reviews.slice';

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
    librarySlice,
    notificationsSlice,
    realtimeSlice,
    reviewsSlice,
);

/** Resets ALL slices to their initial state when logout succeeds, so no user data survives it. */
const rootReducer = (state: ReturnType<typeof appReducer> | undefined, action: UnknownAction) =>
    appReducer(
        logoutMutation.fulfilled.match(action) || forceLogoutMutation.fulfilled.match(action) || accountSessionEnded.match(action)
            ? undefined
            : state,
        action,
    );

function createThunkExtra() {
    const realtimeContainer = createRealtimeContainer();
    return {
        // <clean:extra> — e.g. routines: createRoutineContainer(),
        // Server Actions are injected; the server-only container is never imported here.
        auth: {
            login: loginAction,
            register: registerAction,
            logout: logoutAction,
            getSocketToken: getSocketTokenAction,
            refreshCurrentUser: refreshCurrentUserAction,
            expireSession: expireSessionAction,
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
        library: {
            getLibrary: listLibraryAction,
            getLibraryEntry: getLibraryEntryAction,
            addLibraryEntry: addLibraryEntryAction,
            updateLibraryEntry: updateLibraryEntryAction,
            removeLibraryEntry: removeLibraryEntryAction,
            getLibraryMediaOptions: getLibraryMediaOptionsAction,
        } satisfies LibraryDependencies,
        notifications: {
            list: listNotificationsAction,
            markRead: markNotificationReadAction,
        } satisfies NotificationsDependencies,
        realtime: {
            connect: (getTicket) => realtimeContainer.connect.execute(getTicket),
            disconnect: () => realtimeContainer.disconnect.execute(),
            on: (event, handler) => realtimeContainer.repository.on(event, handler),
            off: (event) => realtimeContainer.repository.off(event),
            onStatus: (handler) => realtimeContainer.repository.onStatus(handler),
            clearStatusHandlers: () => realtimeContainer.repository.clearStatusHandlers(),
            emit: (event, payload) => realtimeContainer.repository.emit(event, payload),
            subscribeEvents: (events, handler) => realtimeContainer.subscribeEvents.execute(events, handler),
            getTicket: getSocketTokenAction,
            expireSession: expireSessionAction,
        } satisfies RealtimeDependencies,
        reviews: {
            list: listReviewsAction,
            create: createReviewAction,
        } satisfies ReviewsDependencies,
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
