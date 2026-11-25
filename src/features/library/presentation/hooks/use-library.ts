'use client';

import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import type {
  AddLibraryEntryParams,
  LibraryQuery,
} from '../../domain/repositories/library.repository';
import type { LibraryEntryChanges } from '../../domain/entities/library-entry';
import {
  addLibraryEntry,
  clearLibraryError,
  clearSelectedLibraryEntry,
  fetchLibrary,
  fetchLibraryEntry,
  fetchLibraryMediaItemIds,
  removeLibraryEntry,
  updateLibraryEntry,
} from '../store/library.slice';
import {
  selectLibraryDetailStatus,
  selectLibraryEntry,
  selectLibraryExistingMediaItemIds,
  selectLibraryExistingIdsStatus,
  selectLibraryError,
  selectLibraryItems,
  selectLibraryMeta,
  selectLibraryMutationStatus,
  selectLibraryQuery,
  selectLibraryStatus,
} from '../store/library.selectors';

export function useLibrary() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectLibraryItems);
  const selectedEntry = useAppSelector(selectLibraryEntry);
  const existingMediaItemIds = useAppSelector(selectLibraryExistingMediaItemIds);
  const existingIdsStatus = useAppSelector(selectLibraryExistingIdsStatus);
  const meta = useAppSelector(selectLibraryMeta);
  const query = useAppSelector(selectLibraryQuery);
  const status = useAppSelector(selectLibraryStatus);
  const detailStatus = useAppSelector(selectLibraryDetailStatus);
  const mutationStatus = useAppSelector(selectLibraryMutationStatus);
  const errorMessage = useAppSelector(selectLibraryError);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchLibrary(query));
  }, [dispatch, query, status]);

  const reload = useCallback(
    (nextQuery: LibraryQuery = query) => {
      dispatch(fetchLibrary(nextQuery));
    },
    [dispatch, query],
  );

  const openEntry = useCallback(
    async (id: string) => {
      const result = await dispatch(fetchLibraryEntry(id));
      return fetchLibraryEntry.fulfilled.match(result);
    },
    [dispatch],
  );

  const closeEntry = useCallback(() => {
    dispatch(clearSelectedLibraryEntry());
  }, [dispatch]);

  const loadExistingMediaItemIds = useCallback(async () => {
    const result = await dispatch(fetchLibraryMediaItemIds());
    return fetchLibraryMediaItemIds.fulfilled.match(result);
  }, [dispatch]);

  const addEntry = useCallback(
    async (params: AddLibraryEntryParams) => {
      const result = await dispatch(addLibraryEntry(params));
      if (addLibraryEntry.fulfilled.match(result)) {
        dispatch(fetchLibrary(query));
        return true;
      }
      return false;
    },
    [dispatch, query],
  );

  const updateEntry = useCallback(
    async (id: string, changes: LibraryEntryChanges) => {
      const result = await dispatch(updateLibraryEntry({ id, changes }));
      if (updateLibraryEntry.fulfilled.match(result)) {
        dispatch(fetchLibrary(query));
        return true;
      }
      return false;
    },
    [dispatch, query],
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      const result = await dispatch(removeLibraryEntry(id));
      const succeeded = removeLibraryEntry.fulfilled.match(result);
      if (succeeded) {
        const nextTotal = Math.max(0, meta.total - 1);
        const nextPage = Math.min(
          query.page ?? 1,
          Math.max(1, Math.ceil(nextTotal / (query.limit ?? 10))),
        );
        dispatch(fetchLibrary({ ...query, page: nextPage }));
      }
      return succeeded;
    },
    [dispatch, meta.total, query],
  );

  const clearError = useCallback(
    () => dispatch(clearLibraryError()),
    [dispatch],
  );

  return {
    items,
    selectedEntry,
    existingMediaItemIds,
    existingIdsStatus,
    meta,
    query,
    status,
    detailStatus,
    isMutating: mutationStatus === 'loading',
    mutationStatus,
    errorMessage,
    reload,
    openEntry,
    closeEntry,
    loadExistingMediaItemIds,
    addEntry,
    updateEntry,
    deleteEntry,
    clearError,
  };
}
