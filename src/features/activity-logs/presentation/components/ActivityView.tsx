'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { Alert } from '@/src/shared/ui/Alert';
import { Pagination } from '@/src/shared/ui/Pagination';
import { ActivityTimeline } from './ActivityTimeline';
import { useActivityLogs } from '../hooks/use-activity-logs';

const subscribeNoop = () => () => {};

export function ActivityView() {
  const activity = useActivityLogs();
  // Un evento de socket puede llegar antes de que esta sección hidrate; hasta entonces se pinta
  // lo mismo que en el servidor para no provocar un hydration mismatch.
  const hydrated = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const { loadPage, status } = activity;
  useEffect(() => { if (status === 'idle') void loadPage(1); }, [loadPage, status]);
  useEffect(() => { if (activity.hasNewActivities) void loadPage(1); }, [activity.hasNewActivities, loadPage]);
  return <section className="space-y-6" aria-labelledby="activity-title">
    <header><h1 id="activity-title" className="text-3xl font-bold">Actividad reciente</h1><p className="mt-2 text-gray-600">Un registro de tus acciones en la biblioteca y la comunidad.</p></header>
    {hydrated && activity.hasNewActivities ? <Alert variant="success">Llegó nueva actividad. Actualizando el historial…</Alert> : null}
    {activity.errorMessage ? <Alert variant="error">{activity.errorMessage}</Alert> : null}
    {activity.status === 'loading' && activity.items.length === 0 ? <p role="status">Cargando actividad…</p> : null}
    {activity.status !== 'loading' && activity.status !== 'failed' && activity.items.length === 0 ? <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-600">Todavía no hay actividad para mostrar.</div> : null}
    {activity.items.length > 0 ? <ActivityTimeline items={activity.items} /> : null}
    {activity.status === 'failed' ? <button type="button" className="rounded-md border px-4 py-2 font-medium hover:bg-gray-50" onClick={() => void activity.reload()}>Reintentar</button> : null}
    {activity.status !== 'loading' ? <Pagination page={activity.meta.page} totalPages={activity.meta.totalPages} onChange={(page) => void activity.loadPage(page)} /> : null}
  </section>;
}
