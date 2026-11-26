/** Aviso persistido que pertenece a la cuenta autenticada. */
export interface Notification {
  id: string;
  eventId: string;
  type: 'MEDIA_MODERATED' | 'REVIEW_VISIBILITY_CHANGED' | 'ROLE_CHANGED';
  payload: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

/** Filtros de la bandeja, limitados al máximo que admite el backend. */
export interface NotificationQuery {
  isRead?: boolean;
  page: number;
  limit: number;
}

export interface NotificationPage {
  data: Notification[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}
