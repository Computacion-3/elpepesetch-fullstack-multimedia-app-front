'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { activityLogsSlice, clearActivityError, fetchActivityPage } from '../store/activity-logs.slice';
import {
  selectActivityError, selectActivityItems, selectActivityMeta, selectActivityPage,
  selectActivityStatus, selectHasNewActivities,
} from '../store/activity-logs.selectors';

export function useActivityLogs() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectActivityItems);
  const meta = useAppSelector(selectActivityMeta);
  const page = useAppSelector(selectActivityPage);
  const status = useAppSelector(selectActivityStatus);
  const errorMessage = useAppSelector(selectActivityError);
  const hasNewActivities = useAppSelector(selectHasNewActivities);
  const loadPage = useCallback((nextPage: number) => dispatch(fetchActivityPage({ page: nextPage, limit: meta.limit })), [dispatch, meta.limit]);
  const reload = useCallback(() => dispatch(fetchActivityPage({ page: 1, limit: meta.limit })), [dispatch, meta.limit]);
  const markNewActivity = useCallback(() => dispatch(activityLogsSlice.actions.activityArrived()), [dispatch]);
  const clearError = useCallback(() => dispatch(clearActivityError()), [dispatch]);
  return { items, meta, page, status, errorMessage, hasNewActivities, loadPage, reload, markNewActivity, clearError };
}
