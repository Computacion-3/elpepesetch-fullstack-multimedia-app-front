'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import {
  connectRealtime,
  disconnectRealtime,
  subscribeToMediaRoom,
  unsubscribeFromMediaRoom,
} from '../store/realtime.slice';
import {
  selectRealtimeEvents,
  selectRealtimeStatus,
  selectSubscribedMediaItemId,
} from '../store/realtime.selectors';
import type { RealtimeEventEnvelope } from '../../domain/entities/realtime-event';

/** Fachada de estado y suscripciones multimedia para componentes cliente. */
export function useRealtime() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectRealtimeStatus);
  const latestEvent = useAppSelector((state) => selectRealtimeEvents(state)[0]);
  const subscribedMediaItemId = useAppSelector(selectSubscribedMediaItemId);

  const connect = useCallback(() => dispatch(connectRealtime()), [dispatch]);
  const disconnect = useCallback(() => dispatch(disconnectRealtime()), [dispatch]);
  const subscribeToMedia = useCallback((mediaItemId: string) => {
    void dispatch(subscribeToMediaRoom(mediaItemId));
  }, [dispatch]);
  const unsubscribeFromMedia = useCallback((mediaItemId: string) => {
    void dispatch(unsubscribeFromMediaRoom(mediaItemId));
  }, [dispatch]);
  return {
    status,
    latestEvent: latestEvent as RealtimeEventEnvelope | undefined,
    subscribedMediaItemId,
    connect,
    disconnect,
    subscribeToMedia,
    unsubscribeFromMedia,
  };
}
