import type { NotificationQuery } from '../../domain/entities/notification';
import type { NotificationDto, NotificationPageDto } from '../dtos/notification.dto';

/** Contrato HTTP para recuperar avisos y marcar uno como leído. */
export interface NotificationsDatasource {
  fetch(query: NotificationQuery): Promise<NotificationPageDto>;
  markRead(id: string): Promise<NotificationDto>;
}
