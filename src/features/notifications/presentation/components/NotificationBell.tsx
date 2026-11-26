'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
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
      <Link href="/notifications" title="Notificaciones" className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-white/10 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand" aria-label={`Notificaciones, ${unreadCount} sin leer`}>
        <Bell size={19} strokeWidth={1.8} aria-hidden="true" />
        {unreadCount > 0 && <span aria-hidden="true" className="absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-bold text-[#17132b] ring-2 ring-background">{unreadCount > 99 ? '99+' : unreadCount}</span>}
      </Link>
      {notice && (
        <p className="fixed right-4 top-20 z-50 max-w-sm rounded-xl border border-brand/40 bg-surface px-4 py-3 text-sm text-foreground shadow-lg" role="status">
          {notice}
        </p>
      )}
    </>
  );
}
