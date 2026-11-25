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
import { createLibraryContainer } from '@/src/features/library/di/library.container';
import { librarySlice } from '@/src/features/library/presentation/store/library.slice';
import type { LibraryDependencies } from '@/src/features/library/presentation/store/library.slice';
import {
    createReviewReportAction,
    listReviewReportsAction,
    resolveReviewReportAction,
} from '@/src/features/reports/presentation/actions/reports.actions';
import { reportsSlice } from '@/src/features/reports/presentation/store/reports.slice';
import type { ReportsDependencies } from '@/src/features/reports/presentation/store/reports.slice';
import {
    createReviewAction,
    deleteReviewAction,
    listReviewMediaOptionsAction,
    listReviewsByMediaAction,
    updateReviewAction,
} from '@/src/features/reviews/presentation/actions/reviews.actions';
import { reviewsSlice } from '@/src/features/reviews/presentation/store/reviews.slice';
import type { ReviewsDependencies } from '@/src/features/reviews/presentation/store/reviews.slice';
import {
    getGlobalStatsAction,
    getPersonalStatsAction,
} from '@/src/features/stats/presentation/actions/stats.actions';
import { statsSlice } from '@/src/features/stats/presentation/store/stats.slice';
import type { StatsDependencies } from '@/src/features/stats/presentation/store/stats.slice';
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
 * Store global de Redux Toolkit: combina los slices de todas las features e inyecta
 * sus casos de uso o Server Actions mediante `extraArgument` de los thunks.
 * Este archivo y las carpetas `di/` son los únicos puntos que conocen implementaciones concretas.
 */
const appReducer = combineSlices(
    // <clean:slices> — e.g. routinesSlice,
    authSlice,
    usersSlice,
    rolesSlice,
    permissionsSlice,
    librarySlice,
    reviewsSlice,
    reportsSlice,
    statsSlice,
    mediaSlice,
    genresSlice,
);

/** Reinicia TODOS los slices a su estado inicial cuando `logoutMutation` termina con éxito. */
const rootReducer = (state: ReturnType<typeof appReducer> | undefined, action: UnknownAction) =>
    appReducer(logoutMutation.fulfilled.match(action) ? undefined : state, action);

function createThunkExtra() {
    return {
        // <clean:extra> — e.g. routines: createRoutineContainer(),
        // Se inyectan Server Actions en módulos conectados a API_URL para mantener server-only los contenedores.
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
        library: createLibraryContainer() satisfies LibraryDependencies,
        reviews: {
            listMediaOptions: listReviewMediaOptionsAction,
            listByMedia: listReviewsByMediaAction,
            create: createReviewAction,
            update: updateReviewAction,
            remove: deleteReviewAction,
        } satisfies ReviewsDependencies,
        reports: {
            createReport: createReviewReportAction,
            listReports: listReviewReportsAction,
            resolveReport: resolveReviewReportAction,
        } satisfies ReportsDependencies,
        stats: {
            getPersonal: getPersonalStatsAction,
            getGlobal: getGlobalStatsAction,
        } satisfies StatsDependencies,
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
