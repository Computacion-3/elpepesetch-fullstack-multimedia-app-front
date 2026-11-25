import type { StatsState } from './stats.slice';

type State = { stats: StatsState };

/** Selecciona las estadísticas personales cargadas en el store. */
export const selectPersonalStats = (state: State) => state.stats.personal;
/** Selecciona las estadísticas globales cargadas en el store. */
export const selectGlobalStats = (state: State) => state.stats.global;
/** Selecciona el estado de carga de estadísticas personales. */
export const selectPersonalStatsStatus = (state: State) => state.stats.personalStatus;
/** Selecciona el estado de carga de estadísticas globales. */
export const selectGlobalStatsStatus = (state: State) => state.stats.globalStatus;
/** Selecciona el error de estadísticas personales, si existe. */
export const selectPersonalStatsError = (state: State) => state.stats.personalError;
/** Selecciona el error de estadísticas globales, si existe. */
export const selectGlobalStatsError = (state: State) => state.stats.globalError;
