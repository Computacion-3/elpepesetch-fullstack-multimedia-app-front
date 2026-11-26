'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import {
  connectRealtime,
  disconnectRealtime,
  subscribeToMediaRoom,
  unsubscribeFromMediaRoom,
} from '../store/realtime.slice';
import { applyMediaModeration, applyMediaRating } from '@/src/features/media/presentation/store/media.slice';
import { incrementUnreadCount, syncNotifications } from '@/src/features/notifications/presentation/store/notifications.slice';
import { refreshCurrentUserMutation } from '@/src/features/auth/presentation/store/auth.slice';
import {
  fetchReviewsByMediaQuery,
  hideReviewFromSocket,
} from '@/src/features/reviews/presentation/store/reviews.slice';
import {
  selectReviewsCurrentPage,
  selectReviewsLimit,
  selectSelectedMediaId,
} from '@/src/features/reviews/presentation/store/reviews.selectors';
import {
  selectRealtimeEvents,
  selectRealtimeStatus,
  selectSubscribedMediaItemId,
} from '../store/realtime.selectors';
import type { RealtimeEventEnvelope, RealtimeEventPayloads } from '../../domain/entities/realtime-event';

/** Fachada de estado y suscripciones multimedia para componentes cliente. */
export function useRealtime() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectRealtimeStatus);
  const latestEvent = useAppSelector((state) => selectRealtimeEvents(state)[0]);
  const subscribedMediaItemId = useAppSelector(selectSubscribedMediaItemId);
  const selectedReviewMediaId = useAppSelector(selectSelectedMediaId);
  const reviewPage = useAppSelector(selectReviewsCurrentPage);
  const reviewLimit = useAppSelector(selectReviewsLimit);

  const connect = useCallback(() => dispatch(connectRealtime()), [dispatch]);
  const disconnect = useCallback(() => dispatch(disconnectRealtime()), [dispatch]);
  const subscribeToMedia = useCallback((mediaItemId: string) => {
    void dispatch(subscribeToMediaRoom(mediaItemId));
  }, [dispatch]);
  const unsubscribeFromMedia = useCallback((mediaItemId: string) => {
    void dispatch(unsubscribeFromMediaRoom(mediaItemId));
  }, [dispatch]);

  /** Sincroniza notificaciones y reingresa a la sala activa tras reconectar. */
  const syncAfterConnect = useCallback((activeMediaItemId: string | null) => {
    void dispatch(syncNotifications());
    if (activeMediaItemId) void dispatch(subscribeToMediaRoom(activeMediaItemId));
  }, [dispatch]);

  /** Aplica en las features correspondientes los efectos de un evento recibido. */
  const handleEvent = useCallback((event: RealtimeEventEnvelope | undefined) => {
    if (!event) return;

    if (event.event === 'media.moderated') {
      dispatch(applyMediaModeration(event.payload as RealtimeEventPayloads['media.moderated']));
      dispatch(incrementUnreadCount());
    } else if (event.event === 'media.rating.updated') {
      dispatch(applyMediaRating(event.payload as RealtimeEventPayloads['media.rating.updated']));
    } else if (event.event === 'review.visibility.changed') {
      const hidden = event.payload as RealtimeEventPayloads['review.visibility.changed'];
      dispatch(hideReviewFromSocket({
        reviewId: hidden.reviewId,
        mediaItemId: hidden.mediaItemId,
        hiddenReason: hidden.hiddenReason,
      }));
      dispatch(incrementUnreadCount());
    } else if (event.event === 'review.created' && event.mediaItemId === selectedReviewMediaId) {
      // Recarga solo si el evento corresponde al medio visible en el panel de reseñas.
      if (event.mediaItemId) {
        void dispatch(fetchReviewsByMediaQuery({
          mediaItemId: event.mediaItemId,
          page: reviewPage,
          limit: reviewLimit,
        }));
      }
    } else if (event.event === 'account.updated') {
      void dispatch(refreshCurrentUserMutation());
      dispatch(incrementUnreadCount());
    }
  }, [dispatch, reviewLimit, reviewPage, selectedReviewMediaId]);
  return {
    status,
    latestEvent: latestEvent as RealtimeEventEnvelope | undefined,
    subscribedMediaItemId,
    connect,
    disconnect,
    subscribeToMedia,
    unsubscribeFromMedia,
    syncAfterConnect,
    handleEvent,
  };
}
