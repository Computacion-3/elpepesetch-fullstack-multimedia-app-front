'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { syncNotifications } from '../store/notifications.slice';
import { useNotifications } from '../hooks/use-notifications';
import { selectRealtimeEvents } from '@/src/features/realtime/presentation/store/realtime.selectors';
import type { RealtimeEventEnvelope, RealtimeEventPayloads } from '@/src/features/realtime/domain/entities/realtime-event';

/** Resume los eventos que necesitan un aviso visible inmediato. */
function describeLiveNotice(event: RealtimeEventEnvelope | undefined): string | null {
  if (!event) return null;
  if (event.event === 'media.moderated') {
    const payload = event.payload as RealtimeEventPayloads['media.moderated'];
    const result = payload.approvalStatus === 'APPROVED' ? 'fue aprobada' : 'fue rechazada';
    const reason = payload.rejectionReason ? ` Motivo: ${payload.rejectionReason}` : '';
    return `Tu propuesta «${payload.title}» ${result}.${reason}`;
  }
  if (event.event === 'review.visibility.changed') {
    const payload = event.payload as RealtimeEventPayloads['review.visibility.changed'];
    return `Una reseña fue ocultada. Motivo: ${payload.hiddenReason}`;
  }
  if (event.event === 'account.updated') {
    const payload = event.payload as RealtimeEventPayloads['account.updated'];
    return `Tu rol cambió a ${payload.role}.`;
  }
  return null;
}

/** Enlace a la bandeja con el total de avisos no leídos. */
export function NotificationBell() {
  const dispatch = useAppDispatch();
  const { unreadCount } = useNotifications();
  const latestEvent = useAppSelector((state) => selectRealtimeEvents(state)[0]);
  const [visibleEventAt, setVisibleEventAt] = useState<string | null>(null);

  useEffect(() => { void dispatch(syncNotifications()); }, [dispatch]);

  useEffect(() => {
    if (!latestEvent) return;
    const show = window.setTimeout(() => setVisibleEventAt(latestEvent.receivedAt), 0);
    const hide = window.setTimeout(() => setVisibleEventAt(null), 7000);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [latestEvent]);

  const notice = visibleEventAt === latestEvent?.receivedAt
    ? describeLiveNotice(latestEvent)
    : null;

  return (
    <>
      <Link href="/notifications" className="relative inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand" aria-label={`Notificaciones, ${unreadCount} sin leer`}>
        <Bell size={17} strokeWidth={1.8} aria-hidden="true" />
        <span>Notificaciones</span>
        {unreadCount > 0 && <span aria-hidden="true" className="rounded-full bg-brand px-2 py-0.5 text-xs font-bold text-[#17132b]">{unreadCount > 99 ? '99+' : unreadCount}</span>}
      </Link>
      {notice && (
        <p className="fixed right-4 top-20 z-50 max-w-sm rounded-xl border border-brand/40 bg-surface px-4 py-3 text-sm text-foreground shadow-lg" role="status">
          {notice}
        </p>
      )}
    </>
  );
}
