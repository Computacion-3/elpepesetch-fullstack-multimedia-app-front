'use client';

import { useNotifications } from '../hooks/use-notifications';
import { useEffect } from 'react';
import { Alert } from '@/src/shared/ui/Alert';
import { Button } from '@/src/shared/ui/Button';

/** Muestra la lista paginada y guarda las lecturas en el backend. */
export function NotificationsInbox() {
  const notifications = useNotifications();
  const { load } = notifications;

  useEffect(() => {
    load({ page: 1, limit: 10 });
  }, [load]);

  function setFilter(value: string) {
    const isRead = value === 'all' ? undefined : value === 'read';
    notifications.load({ page: 1, limit: 10, isRead });
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Tu cuenta</p>
          <h1 className="text-3xl font-bold">Notificaciones</h1>
          <p className="mt-2 text-sm text-muted">{notifications.unreadCount} avisos sin leer</p>
        </div>
        <label className="text-sm">
          <span className="sr-only">Filtrar notificaciones</span>
          <select className="min-h-11 rounded-lg border border-white/20 bg-surface px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand" defaultValue="all" onChange={(event) => setFilter(event.target.value)}>
            <option value="all">Todas</option>
            <option value="unread">Sin leer</option>
            <option value="read">Leídas</option>
          </select>
        </label>
      </header>

      {notifications.errorMessage && <div className="mb-4"><Alert variant="error">{notifications.errorMessage}</Alert></div>}
      {notifications.status === 'loading' && <p role="status">Cargando avisos…</p>}
      {notifications.status === 'succeeded' && notifications.items.length === 0 && <p className="rounded-2xl border border-dashed border-white/20 bg-surface p-8 text-center text-muted">No hay notificaciones en esta página.</p>}

      <ul className="space-y-3">
        {notifications.items.map((item) => (
          <li key={item.id} className={`rounded-2xl border p-4 ${item.isRead ? 'border-white/10 bg-surface' : 'border-brand/40 bg-brand/5'}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{item.message}</p>
                <time className="mt-1 block text-xs text-muted" dateTime={item.createdAt}>{item.dateLabel}</time>
              </div>
              {!item.isRead && <Button variant="secondary" className="px-3 py-1.5" type="button" onClick={() => void notifications.markRead(item.id)}>Marcar como leída</Button>}
            </div>
          </li>
        ))}
      </ul>

      <nav className="mt-6 flex flex-wrap items-center justify-end gap-4" aria-label="Paginación de notificaciones">
        <Button variant="secondary" className="px-3 py-1.5" type="button" disabled={notifications.meta.page <= 1 || notifications.status === 'loading'} onClick={() => notifications.load({ ...notifications.query, page: notifications.meta.page - 1 })}>Anterior</Button>
        <span className="text-sm">Página {notifications.meta.page} de {Math.max(1, notifications.meta.totalPages)}</span>
        <Button variant="secondary" className="px-3 py-1.5" type="button" disabled={notifications.meta.page >= notifications.meta.totalPages || notifications.status === 'loading'} onClick={() => notifications.load({ ...notifications.query, page: notifications.meta.page + 1 })}>Siguiente</Button>
      </nav>
    </main>
  );
}
