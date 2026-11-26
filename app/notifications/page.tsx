import { NotificationsInbox } from '@/src/features/notifications/presentation/components/NotificationsInbox';
import { requireSession } from '@/src/lib/dal';
import { Suspense } from 'react';

/** Comprueba la sesión antes de renderizar avisos personales. */
async function AuthenticatedNotifications() {
  await requireSession();
  return <NotificationsInbox />;
}

/** Reserva el shell mientras se valida la sesión de la bandeja. */
export default function NotificationsPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted">Cargando notificaciones...</p>}>
      <AuthenticatedNotifications />
    </Suspense>
  );
}
