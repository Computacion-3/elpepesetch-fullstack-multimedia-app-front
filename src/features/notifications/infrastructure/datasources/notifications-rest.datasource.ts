import type { HttpClient } from '@/src/shared/infrastructure/http-client';
import type { NotificationQuery } from '../../domain/entities/notification';
import type { NotificationPageDto, NotificationDto } from '../dtos/notification.dto';
import type { NotificationsDatasource } from './notifications.datasource';

/** Usa los endpoints protegidos de la bandeja con el token de la petición actual. */
export class NotificationsRestDatasource implements NotificationsDatasource {
  constructor(private readonly http: HttpClient, private readonly token: string) {}

  fetch(query: NotificationQuery): Promise<NotificationPageDto> {
    const params = new URLSearchParams({ page: String(query.page), limit: String(query.limit) });
    if (query.isRead !== undefined) params.set('isRead', String(query.isRead));
    return this.http.get(`/notifications?${params}`, this.token);
  }

  markRead(id: string): Promise<NotificationDto> {
    return this.http.patch(`/notifications/${encodeURIComponent(id)}/read`, {}, this.token);
  }
}
