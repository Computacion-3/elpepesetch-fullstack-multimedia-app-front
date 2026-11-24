import { createSelector } from '@reduxjs/toolkit';
import type { UsersState } from './users.slice';

// Selectors receive only the slice they need, so this file never imports RootState (no cycles).
type State = { users: UsersState };

export const selectUsers = (state: State) => state.users.items;
export const selectUsersTotal = (state: State) => state.users.total;
export const selectUsersCurrentPage = (state: State) => state.users.page;
export const selectUsersLimit = (state: State) => state.users.limit;
export const selectUsersTotalPages = (state: State) => state.users.totalPages;
/** Memoized: returns the same object until one of the pagination fields changes. */
export const selectUsersPage = createSelector(
    [selectUsersTotal, selectUsersCurrentPage, selectUsersLimit, selectUsersTotalPages],
    (total, page, limit, totalPages) => ({ total, page, limit, totalPages }),
);
export const selectUsersFilters = (state: State) => state.users.filters;
export const selectUsersStatus = (state: State) => state.users.status;
export const selectUsersError = (state: State) => state.users.errorMessage;
