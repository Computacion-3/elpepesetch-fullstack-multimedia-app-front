import type { LibraryState } from './library.slice';

type LibraryRootState = { library: LibraryState };

export const selectLibraryItems = (state: LibraryRootState) =>
  state.library.items;
export const selectLibraryEntry = (state: LibraryRootState) =>
  state.library.selectedEntry;
export const selectLibraryMediaOptions = (state: LibraryRootState) =>
  state.library.mediaOptions;
export const selectLibraryMeta = (state: LibraryRootState) =>
  state.library.meta;
export const selectLibraryQuery = (state: LibraryRootState) =>
  state.library.query;
export const selectLibraryStatus = (state: LibraryRootState) =>
  state.library.status;
export const selectLibraryDetailStatus = (state: LibraryRootState) =>
  state.library.detailStatus;
export const selectLibraryMutationStatus = (state: LibraryRootState) =>
  state.library.mutationStatus;
export const selectLibraryOptionsStatus = (state: LibraryRootState) =>
  state.library.optionsStatus;
export const selectLibraryError = (state: LibraryRootState) =>
  state.library.errorMessage;
