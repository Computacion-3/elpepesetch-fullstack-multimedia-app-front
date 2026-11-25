'use server';

import { runAuthenticated } from '@/src/lib/run-authenticated';
import type { ActionResult } from '@/src/shared/domain/action-result';
import type { NotificationQuery } from '../../domain/entities/notification';
import { createNotificationsContainer } from '../../di/notifications.container';
import { NotificationViewModelMapper } from '../viewmodels/notification.viewmodel';
import type { NotificationViewModel } from '../viewmodels/notification.viewmodel';

/** Recupera avisos persistidos de la cuenta con paginación y filtro opcional. */
export async function listNotificationsAction(query: NotificationQuery): Promise<ActionResult<{
  data: NotificationViewModel[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}>> {
  return runAuthenticated('No se pudieron cargar las notificaciones', async (token) => {
    const result = await createNotificationsContainer(token).list.execute(query);
    return { ...result, data: result.data.map(NotificationViewModelMapper.toViewModel) };
  });
}

/** Guarda en el servidor que el aviso propio ya fue leído. */
export async function markNotificationReadAction(id: string): Promise<ActionResult<NotificationViewModel>> {
  return runAuthenticated('No se pudo actualizar la notificación', async (token) => {
    const result = await createNotificationsContainer(token).markRead.execute(id);
    return NotificationViewModelMapper.toViewModel(result);
  });
}
