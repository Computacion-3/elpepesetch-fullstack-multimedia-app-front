import type { LibraryState } from './library.slice';

type LibraryRootState = { library: LibraryState };

export const selectLibraryItems = (state: LibraryRootState) =>
  state.library.items;
export const selectLibraryEntry = (state: LibraryRootState) =>
  state.library.selectedEntry;
export const selectLibraryExistingMediaItemIds = (state: LibraryRootState) =>
  state.library.existingMediaItemIds;
export const selectLibraryExistingIdsStatus = (state: LibraryRootState) =>
  state.library.existingIdsStatus;
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
export const selectLibraryError = (state: LibraryRootState) =>
  state.library.errorMessage;
