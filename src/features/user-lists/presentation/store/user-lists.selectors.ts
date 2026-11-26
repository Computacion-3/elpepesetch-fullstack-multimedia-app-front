import type { UserListsState } from './user-lists.slice';
type State = { userLists: UserListsState };
export const selectMyLists = (state: State) => state.userLists.ownLists;
export const selectPublicLists = (state: State) => state.userLists.publicLists;
export const selectSelectedUserList = (state: State) =>
  state.userLists.selectedList;
export const selectUserListsError = (state: State) =>
  state.userLists.errorMessage;
export const selectMyListsStatus = (state: State) => state.userLists.ownStatus;
export const selectPublicListsStatus = (state: State) =>
  state.userLists.publicStatus;
export const selectUserListDetailStatus = (state: State) =>
  state.userLists.detailStatus;
export const selectUserListMutationStatus = (state: State) =>
  state.userLists.mutationStatus;
