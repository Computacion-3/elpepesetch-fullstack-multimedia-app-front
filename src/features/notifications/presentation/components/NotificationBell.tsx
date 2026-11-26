'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useNotifications } from '../hooks/use-notifications';
import { useRealtime } from '@/src/features/realtime/presentation/hooks/use-realtime';

/** Resume los eventos que necesitan un aviso visible inmediato. */
function describeLiveNotice(event: ReturnType<typeof useRealtime>['latestEvent']): string | null {
  if (!event) return null;
  if (event.event === 'media.moderated') {
    const payload = event.payload as { title: string; approvalStatus: 'APPROVED' | 'REJECTED'; rejectionReason?: string };
    const result = payload.approvalStatus === 'APPROVED' ? 'fue aprobada' : 'fue rechazada';
    const reason = payload.rejectionReason ? ` Motivo: ${payload.rejectionReason}` : '';
    return `Tu propuesta «${payload.title}» ${result}.${reason}`;
  }
  if (event.event === 'review.visibility.changed') {
    const payload = event.payload as { hiddenReason: string };
    return `Una reseña fue ocultada. Motivo: ${payload.hiddenReason}`;
  }
  if (event.event === 'account.updated') {
    const payload = event.payload as { role: 'USER' | 'MODERATOR' | 'ADMIN' };
    return `Tu rol cambió a ${payload.role}.`;
  }
  return null;
}

/** Enlace a la bandeja con el total de avisos no leídos. */
export function NotificationBell() {
  const { unreadCount, sync } = useNotifications();
  const { latestEvent } = useRealtime();
  const [visibleEventAt, setVisibleEventAt] = useState<string | null>(null);

  useEffect(() => { void sync(); }, [sync]);

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
      <Link href="/notifications" className="relative rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-500/10" aria-label={`Notificaciones, ${unreadCount} sin leer`}>
        Notificaciones
        {unreadCount > 0 && <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-xs text-white">{unreadCount > 99 ? '99+' : unreadCount}</span>}
      </Link>
      {notice && (
        <p className="fixed right-4 top-20 z-50 max-w-sm rounded-md border border-brand/40 bg-white px-4 py-3 text-sm text-gray-800 shadow-lg" role="status">
          {notice}
        </p>
      )}
    </>
  );
}
