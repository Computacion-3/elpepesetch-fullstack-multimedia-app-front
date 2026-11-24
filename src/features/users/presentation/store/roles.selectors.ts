import type { RolesState } from './roles.slice';

// Selectors receive only the slice they need, so this file never imports RootState (no cycles).
type State = { roles: RolesState };

export const selectRoles = (state: State) => state.roles.items;
export const selectSelectedRole = (state: State) => state.roles.selected;
export const selectRolesStatus = (state: State) => state.roles.status;
export const selectRolesError = (state: State) => state.roles.errorMessage;
