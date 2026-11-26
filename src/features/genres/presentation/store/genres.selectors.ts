import type { GenresState } from './genres.slice';

/** Selectores aislados por slice para evitar dependencias circulares con RootState. */
type State = { genres: GenresState };

export const selectGenres = (state: State) => state.genres.items;
export const selectGenresStatus = (state: State) => state.genres.status;
export const selectGenresMutationStatus = (state: State) => state.genres.mutationStatus;
export const selectGenresError = (state: State) => state.genres.errorMessage;
