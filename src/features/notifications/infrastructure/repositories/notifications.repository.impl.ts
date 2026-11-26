import { toDomainError } from '@/src/shared/infrastructure/error-translator';
import type { NotificationPage, NotificationQuery, Notification } from '../../domain/entities/notification';
import type { NotificationsRepository } from '../../domain/repositories/notifications.repository';
import type { NotificationsDatasource } from '../datasources/notifications.datasource';

/** Traduce los errores de HTTP y conserva la forma simple de la entidad. */
export class NotificationsRepositoryImpl implements NotificationsRepository {
  constructor(private readonly datasource: NotificationsDatasource) {}

  async list(query: NotificationQuery): Promise<NotificationPage> {
    try {
      return await this.datasource.fetch(query);
    } catch (error) {
      throw toDomainError(error);
    }
  }

  async markRead(id: string): Promise<Notification> {
    try {
      return await this.datasource.markRead(id);
    } catch (error) {
      throw toDomainError(error);
    }
  }
}
