'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import type { NotificationQuery } from '../../domain/entities/notification';
import {
  clearNotificationsError,
  fetchNotifications,
  incrementUnreadCount,
  markNotificationRead,
  syncNotifications,
} from '../store/notifications.slice';
import {
  selectNotifications,
  selectNotificationsError,
  selectNotificationsMeta,
  selectNotificationsQuery,
  selectNotificationsStatus,
  selectUnreadNotificationCount,
} from '../store/notifications.selectors';

/** Fachada de la bandeja para componentes de cliente. */
export function useNotifications() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectNotifications);
  const meta = useAppSelector(selectNotificationsMeta);
  const query = useAppSelector(selectNotificationsQuery);
  const status = useAppSelector(selectNotificationsStatus);
  const unreadCount = useAppSelector(selectUnreadNotificationCount);
  const errorMessage = useAppSelector(selectNotificationsError);

  const load = useCallback((nextQuery: NotificationQuery) => {
    void dispatch(fetchNotifications(nextQuery));
  }, [dispatch]);

  const markRead = useCallback(async (id: string) => {
    const result = await dispatch(markNotificationRead(id));
    return markNotificationRead.fulfilled.match(result);
  }, [dispatch]);

  /** Sincroniza la bandeja con las notificaciones persistidas por el backend. */
  const sync = useCallback(async () => {
    const result = await dispatch(syncNotifications());
    return syncNotifications.fulfilled.match(result);
  }, [dispatch]);

  /** Registra en el contador un aviso recibido por la conexión en vivo. */
  const registerRealtimeNotification = useCallback(() => {
    dispatch(incrementUnreadCount());
  }, [dispatch]);

  const clearError = useCallback(() => dispatch(clearNotificationsError()), [dispatch]);

  return {
    items,
    meta,
    query,
    status,
    unreadCount,
    errorMessage,
    load,
    markRead,
    sync,
    registerRealtimeNotification,
    clearError,
  };
}
