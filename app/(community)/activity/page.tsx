import { Suspense } from 'react';
import { requireSession } from '@/src/lib/dal';
import { ActivityRouteClient } from './ActivityRouteClient';
import { Spinner } from '@/src/shared/ui/Spinner';

async function ActivityContent() {
  await requireSession();
  return <ActivityRouteClient />;
}

export default function ActivityPage() {
  return <Suspense fallback={<Spinner label="Cargando actividad" size="lg" className="py-16" />}><ActivityContent /></Suspense>;
}
