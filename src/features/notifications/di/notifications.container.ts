import 'server-only';
import { createFetchHttpClient } from '@/src/shared/infrastructure/http-client';
import { ListNotificationsUseCase } from '../domain/usecases/list-notifications.usecase';
import { MarkNotificationReadUseCase } from '../domain/usecases/mark-notification-read.usecase';
import { NotificationsRestDatasource } from '../infrastructure/datasources/notifications-rest.datasource';
import { NotificationsRepositoryImpl } from '../infrastructure/repositories/notifications.repository.impl';

/** Construye los casos de uso con el cliente HTTP y la sesión de la acción actual. */
export function createNotificationsContainer(token: string) {
  const datasource = new NotificationsRestDatasource(createFetchHttpClient(), token);
  const repository = new NotificationsRepositoryImpl(datasource);
  return {
    list: new ListNotificationsUseCase(repository),
    markRead: new MarkNotificationReadUseCase(repository),
  };
}
