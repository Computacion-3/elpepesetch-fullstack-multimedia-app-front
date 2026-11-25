'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/features/auth/presentation/hooks/use-auth';
import { useAppDispatch } from '@/src/store/hooks';
import { useAppSelector } from '@/src/store/hooks';
import { connectRealtime, disconnectRealtime, subscribeToMediaRoom } from '../store/realtime.slice';
import { selectRealtimeEvents, selectRealtimeStatus, selectSubscribedMediaItemId } from '../store/realtime.selectors';
import { incrementUnreadCount, syncNotifications } from '@/src/features/notifications/presentation/store/notifications.slice';
import { applyMediaModeration, applyMediaRating } from '@/src/features/media/presentation/store/media.slice';
import { fetchReviews, hideReviewFromSocket } from '@/src/features/reviews/presentation/store/reviews.slice';
import { selectReviewsQuery } from '@/src/features/reviews/presentation/store/reviews.selectors';
import { refreshCurrentUserMutation } from '@/src/features/auth/presentation/store/auth.slice';
import type { RealtimeEventPayloads } from '../../domain/entities/realtime-event';

/** Mantiene el socket durante la sesión y lo cierra al salir o desactivarse la cuenta. */
export function RealtimeSessionManager() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, sessionEndedReason } = useAuth();
  const userId = user?.id;
  const hadSession = useRef(false);
  const status = useAppSelector(selectRealtimeStatus);
  const latestEvent = useAppSelector((state) => selectRealtimeEvents(state)[0]);
  const activeMediaId = useAppSelector(selectSubscribedMediaItemId);
  const reviewQuery = useAppSelector(selectReviewsQuery);
  const activeMediaRef = useRef(activeMediaId);

  useEffect(() => {
    if (!userId) {
      void dispatch(disconnectRealtime());
      return;
    }
    void dispatch(connectRealtime());
    return () => { void dispatch(disconnectRealtime()); };
  }, [dispatch, userId]);

  useEffect(() => {
    if (user) {
      hadSession.current = true;
      return;
    }
    if (hadSession.current) {
      hadSession.current = false;
      // La acción de logout o account.deactivated limpia el store y lleva a un login nuevo.
      router.replace(sessionEndedReason === 'account-deactivated'
        ? '/login?reason=account-deactivated'
        : '/login?reason=session-ended');
    }
  }, [router, sessionEndedReason, user]);

  useEffect(() => {
    activeMediaRef.current = activeMediaId;
  }, [activeMediaId]);

  useEffect(() => {
    if (status !== 'connected') return;
    // Vuelve a pedir lo que llegó durante la desconexión y a entrar en la sala activa.
    void dispatch(syncNotifications());
    if (activeMediaRef.current) void dispatch(subscribeToMediaRoom(activeMediaRef.current));
  }, [dispatch, status]);

  useEffect(() => {
    if (!latestEvent) return;
    if (latestEvent.event === 'media.moderated') {
      dispatch(applyMediaModeration(latestEvent.payload as RealtimeEventPayloads['media.moderated']));
      dispatch(incrementUnreadCount());
    } else if (latestEvent.event === 'media.rating.updated') {
      dispatch(applyMediaRating(latestEvent.payload as RealtimeEventPayloads['media.rating.updated']));
    } else if (latestEvent.event === 'review.visibility.changed') {
      const hidden = latestEvent.payload as RealtimeEventPayloads['review.visibility.changed'];
      dispatch(hideReviewFromSocket({ reviewId: hidden.reviewId, mediaItemId: hidden.mediaItemId, hiddenReason: hidden.hiddenReason }));
      dispatch(incrementUnreadCount());
    } else if (latestEvent.event === 'review.created' && latestEvent.mediaItemId) {
      void dispatch(fetchReviews({ mediaItemId: latestEvent.mediaItemId, query: reviewQuery }));
    } else if (latestEvent.event === 'account.updated') {
      void dispatch(refreshCurrentUserMutation());
      dispatch(incrementUnreadCount());
    }
  }, [dispatch, latestEvent, reviewQuery]);

  return null;
}
