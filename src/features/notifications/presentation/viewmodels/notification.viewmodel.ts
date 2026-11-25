import type { Notification } from '../../domain/entities/notification';

/** Convierte fechas y payloads a una forma sencilla para Redux y React. */
export interface NotificationViewModel extends Notification {
  dateLabel: string;
  message: string;
}

export class NotificationViewModelMapper {
  static toViewModel(notification: Notification): NotificationViewModel {
    const message = notification.type === 'MEDIA_MODERATED'
      ? `Tu propuesta «${String(notification.payload.title ?? 'Elemento multimedia')}» fue ${notification.payload.approvalStatus === 'APPROVED' ? 'aprobada' : 'rechazada'}.`
      : notification.type === 'REVIEW_VISIBILITY_CHANGED'
        ? `Una reseña fue ocultada: ${String(notification.payload.hiddenReason ?? 'sin motivo indicado')}`
        : `Tu rol cambió a ${String(notification.payload.role ?? 'actualizado')}.`;
    return {
      ...notification,
      dateLabel: new Date(notification.createdAt).toLocaleString('es-CO'),
      message,
    };
  }
}
