import type { PermissionsState } from './permissions.slice';

// Selectors receive only the slice they need, so this file never imports RootState (no cycles).
type State = { permissions: PermissionsState };

export const selectPermissions = (state: State) => state.permissions.items;
export const selectPermissionsStatus = (state: State) => state.permissions.status;
export const selectPermissionsError = (state: State) => state.permissions.errorMessage;
