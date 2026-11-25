import type { Notification } from '../entities/notification';
import type { NotificationsRepository } from '../repositories/notifications.repository';

/** Marca como leído un aviso que el backend confirma que pertenece al usuario. */
export class MarkNotificationReadUseCase {
  constructor(private readonly repository: NotificationsRepository) {}

  execute(id: string): Promise<Notification> {
    return this.repository.markRead(id);
  }
}
