'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/features/auth/presentation/hooks/use-auth';
import { useRealtime } from '../hooks/use-realtime';

/** Mantiene el socket durante la sesión y lo cierra al salir o desactivarse la cuenta. */
export function RealtimeSessionManager() {
  const router = useRouter();
  const { user, sessionEndedReason } = useAuth();
  const {
    status,
    latestEvent,
    subscribedMediaItemId,
    connect,
    disconnect,
    syncAfterConnect,
    handleEvent,
  } = useRealtime();
  const userId = user?.id;
  const hadSession = useRef(false);
  const activeMediaRef = useRef(subscribedMediaItemId);

  useEffect(() => {
    if (!userId) {
      void disconnect();
      return;
    }
    void connect();
    return () => { void disconnect(); };
  }, [connect, disconnect, userId]);

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
    activeMediaRef.current = subscribedMediaItemId;
  }, [subscribedMediaItemId]);

  useEffect(() => {
    if (status !== 'connected') return;
    // Vuelve a pedir lo que llegó durante la desconexión y a entrar en la sala activa.
    syncAfterConnect(activeMediaRef.current);
  }, [status, syncAfterConnect]);

  useEffect(() => {
    handleEvent(latestEvent);
  }, [handleEvent, latestEvent]);

  return null;
}
