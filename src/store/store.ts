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

/**
 * Global store: combines feature slices and injects feature use cases as the thunk extraArgument.
 * This and the feature di/ folders are the only places that know concrete implementations.
 */
const appReducer = combineSlices(
    // <clean:slices> — e.g. routinesSlice,
    authSlice,
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
