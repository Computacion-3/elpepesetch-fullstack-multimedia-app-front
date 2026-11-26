'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { subscribeToMediaRoom, unsubscribeFromMediaRoom } from '../store/realtime.slice';
import { selectLatestRealtimeEvent, selectRealtimeStatus } from '../store/realtime.selectors';

/** Fachada de estado y suscripciones multimedia para componentes cliente. */
export function useRealtime() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectRealtimeStatus);
  const latestEvent = useAppSelector(selectLatestRealtimeEvent);
  const subscribeToMedia = useCallback((mediaItemId: string) => {
    void dispatch(subscribeToMediaRoom(mediaItemId));
  }, [dispatch]);
  const unsubscribeFromMedia = useCallback((mediaItemId: string) => {
    void dispatch(unsubscribeFromMediaRoom(mediaItemId));
  }, [dispatch]);
  return { status, latestEvent, subscribeToMedia, unsubscribeFromMedia };
}
