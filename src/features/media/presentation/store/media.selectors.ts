import type { MediaState } from './media.slice';

/** Selectores toman solo el slice para evitar importar RootState y crear ciclos. */
type State = { media: MediaState };

export const selectMediaItems = (state: State) => state.media.items;
export const selectSelectedMedia = (state: State) => state.media.selectedItem;
export const selectPendingMedia = (state: State) => state.media.pendingItems;
export const selectMediaQuery = (state: State) => state.media.query;
export const selectMediaMeta = (state: State) => state.media.meta;
export const selectPendingMediaMeta = (state: State) => state.media.pendingMeta;
export const selectMediaListStatus = (state: State) => state.media.listStatus;
export const selectMediaDetailStatus = (state: State) => state.media.detailStatus;
export const selectPendingMediaStatus = (state: State) => state.media.pendingStatus;
export const selectMediaMutationStatus = (state: State) => state.media.mutationStatus;
export const selectMediaError = (state: State) => state.media.errorMessage;
