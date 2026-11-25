import type { Notification } from '../../domain/entities/notification';

/** Forma que serializa el API REST de notificaciones. */
export type NotificationDto = Notification;

export interface NotificationPageDto {
  data: NotificationDto[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}
