import type { NotificationQuery, NotificationPage } from '../entities/notification';
import type { NotificationsRepository } from '../repositories/notifications.repository';
import { ValidationError } from '@/src/shared/domain/errors';

/** Valida la paginación y pide al repositorio la página seleccionada. */
export class ListNotificationsUseCase {
  constructor(private readonly repository: NotificationsRepository) {}

  execute(query: NotificationQuery): Promise<NotificationPage> {
    if (!Number.isInteger(query.page) || query.page < 1) {
      throw new ValidationError('La página debe ser un entero positivo.');
    }
    if (!Number.isInteger(query.limit) || query.limit < 1 || query.limit > 50) {
      throw new ValidationError('El límite debe estar entre 1 y 50.');
    }
    return this.repository.list(query);
  }
}
