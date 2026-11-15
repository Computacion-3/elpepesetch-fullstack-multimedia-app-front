import { combineSlices, configureStore } from "@reduxjs/toolkit";
import { createLibraryContainer } from "@/src/features/library/di/library.container";
import { librarySlice } from "@/src/features/library/presentation/store/library.slice";
import type { LibraryDependencies } from "@/src/features/library/presentation/store/library.slice";
// <clean:imports> — add one slice and container import per feature.

const rootReducer = combineSlices(
  librarySlice,
  // <clean:slices> — register each feature slice above.
);

function createThunkExtra() {
  return {
    library: createLibraryContainer() satisfies LibraryDependencies,
    // <clean:extra> — inject each feature container into thunk middleware.
  };
}

export const makeStore = () => configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: { extraArgument: createThunkExtra() } }),
});

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = AppStore["dispatch"];
