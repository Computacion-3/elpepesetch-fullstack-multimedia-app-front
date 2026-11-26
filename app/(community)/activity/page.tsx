import { Suspense } from 'react';
import { requireSession } from '@/src/lib/dal';
import { ActivityRouteClient } from './ActivityRouteClient';

async function ActivityContent() {
  await requireSession();
  return <ActivityRouteClient />;
}

export default function ActivityPage() {
  return <Suspense fallback={<p role="status">Cargando actividad…</p>}><ActivityContent /></Suspense>;
}
