import { combineSlices, configureStore } from '@reduxjs/toolkit';
// <clean:imports> — one slice import and one container import per feature (keep this marker).

/**
 * Global store: combines feature slices and injects feature use cases as the thunk extraArgument.
 * This and the feature di/ folders are the only places that know concrete implementations.
 */
const rootReducer = combineSlices(
    // <clean:slices> — e.g. routinesSlice,
);

function createThunkExtra() {
    return {
        // <clean:extra> — e.g. routines: createRoutineContainer(),
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
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = AppStore['dispatch'];
