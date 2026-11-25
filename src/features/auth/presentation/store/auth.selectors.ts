import type { AuthState } from './auth.slice';

// Selectors receive only the slice they need, so this file never imports RootState (no cycles).
type State = { auth: AuthState };

export const selectAuthUser = (state: State) => state.auth.user;
export const selectIsAuthenticated = (state: State) => state.auth.user !== null;
export const selectAuthStatus = (state: State) => state.auth.status;
export const selectAuthError = (state: State) => state.auth.errorMessage;
export const selectSessionEndedReason = (state: State) => state.auth.sessionEndedReason;
