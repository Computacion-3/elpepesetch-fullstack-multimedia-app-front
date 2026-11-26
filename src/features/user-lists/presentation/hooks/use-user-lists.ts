'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import type {
  UserListChanges,
  UserListDraft,
} from '../../domain/entities/user-list';
import type { PublicListsQuery } from '../../domain/repositories/user-lists.repository';
import {
  addItemToList,
  clearSelectedUserList,
  clearUserListsError,
  createUserList,
  deleteUserList,
  fetchMyLists,
  fetchPublicLists,
  fetchUserList,
  removeItemFromList,
  updateUserList,
} from '../store/user-lists.slice';
import {
  selectMyLists,
  selectMyListsStatus,
  selectPublicLists,
  selectPublicListsStatus,
  selectSelectedUserList,
  selectUserListDetailStatus,
  selectUserListMutationStatus,
  selectUserListsError,
} from '../store/user-lists.selectors';

export function useUserLists() {
  const dispatch = useAppDispatch();
  const ownLists = useAppSelector(selectMyLists);
  const publicLists = useAppSelector(selectPublicLists);
  const selectedList = useAppSelector(selectSelectedUserList);
  const ownStatus = useAppSelector(selectMyListsStatus);
  const publicStatus = useAppSelector(selectPublicListsStatus);
  const detailStatus = useAppSelector(selectUserListDetailStatus);
  const mutationStatus = useAppSelector(selectUserListMutationStatus);
  const errorMessage = useAppSelector(selectUserListsError);

  const reload = useCallback(() => dispatch(fetchMyLists()), [dispatch]);
  const loadPublic = useCallback(
    (query: PublicListsQuery) => dispatch(fetchPublicLists(query)),
    [dispatch],
  );
  const openList = useCallback(
    async (id: string) =>
      fetchUserList.fulfilled.match(await dispatch(fetchUserList(id))),
    [dispatch],
  );
  const create = useCallback(
    async (draft: UserListDraft) =>
      createUserList.fulfilled.match(await dispatch(createUserList(draft))),
    [dispatch],
  );
  const update = useCallback(
    async (id: string, changes: UserListChanges) =>
      updateUserList.fulfilled.match(
        await dispatch(updateUserList({ id, changes })),
      ),
    [dispatch],
  );
  const remove = useCallback(
    async (id: string) =>
      deleteUserList.fulfilled.match(await dispatch(deleteUserList(id))),
    [dispatch],
  );
  const addItem = useCallback(
    async (listId: string, mediaItemId: string) =>
      addItemToList.fulfilled.match(
        await dispatch(addItemToList({ listId, mediaItemId })),
      ),
    [dispatch],
  );
  const removeItem = useCallback(
    async (listId: string, mediaItemId: string) =>
      removeItemFromList.fulfilled.match(
        await dispatch(removeItemFromList({ listId, mediaItemId })),
      ),
    [dispatch],
  );
  const closeList = useCallback(
    () => dispatch(clearSelectedUserList()),
    [dispatch],
  );
  const clearError = useCallback(
    () => dispatch(clearUserListsError()),
    [dispatch],
  );

  return {
    ownLists,
    publicLists,
    selectedList,
    ownStatus,
    publicStatus,
    detailStatus,
    mutationStatus,
    isMutating: mutationStatus === 'loading',
    errorMessage,
    reload,
    loadPublic,
    openList,
    create,
    update,
    remove,
    addItem,
    removeItem,
    closeList,
    clearError,
  };
}
