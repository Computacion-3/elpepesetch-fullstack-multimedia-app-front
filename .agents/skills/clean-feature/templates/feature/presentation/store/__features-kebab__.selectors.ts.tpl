import type { __Features__State } from './__features-kebab__.slice';

// Selectors receive only the slice they need, so this file never imports RootState (no cycles).
type State = { __features__: __Features__State };

export const select__Features__ = (state: State) => state.__features__.items;
export const select__Features__Status = (state: State) => state.__features__.status;
export const select__Features__IsMutating = (state: State) => state.__features__.mutationStatus === 'loading';
export const select__Features__Error = (state: State) => state.__features__.errorMessage;
// Use createSelector from @reduxjs/toolkit for derived data that returns new arrays/objects.
