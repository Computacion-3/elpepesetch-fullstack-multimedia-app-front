import type { NotificationPage, NotificationQuery, Notification } from '../entities/notification';

/** Puerto de lectura y actualización de los avisos del usuario. */
export interface NotificationsRepository {
  list(query: NotificationQuery): Promise<NotificationPage>;
  markRead(id: string): Promise<Notification>;
}
