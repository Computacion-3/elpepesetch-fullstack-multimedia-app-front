/** Estados que la interfaz muestra mientras Socket.IO conecta o se recupera. */
export type RealtimeConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

/** Nombres y campos que el gateway del backend envía al cliente. */
export interface RealtimeEventPayloads {
  'media.moderated': { mediaItemId: string; title: string; approvalStatus: 'APPROVED' | 'REJECTED'; rejectionReason?: string };
  'moderation.queue.changed': { kind: 'MEDIA' | 'REPORT'; pendingMedia: number; openReports: number };
  'review.visibility.changed': { reviewId: string; mediaItemId: string; isHidden: true; hiddenReason: string };
  'account.updated': { role: 'USER' | 'MODERATOR' | 'ADMIN' };
  'account.deactivated': Record<string, never>;
  'activity.created': { activityId: string; action: string; mediaItemId?: string; createdAt: string };
  'media.rating.updated': { mediaItemId: string; averageRating: number; ratingsCount: number };
  'review.created': { reviewId: string; title: string | null; username: string };
  'list.created': { listId: string; name: string; visibility: string; createdAt: string };
  'list.updated': { listId: string; name: string; description: string | null; visibility: string; updatedAt: string };
  'list.deleted': { listId: string };
  'list.item.added': { listId: string; mediaItemId: string; addedAt: string };
  'list.item.removed': { listId: string; mediaItemId: string };
}

export type RealtimeEventName = keyof RealtimeEventPayloads;

/** Eventos que el gateway puede enviar a este cliente. */
export const REALTIME_EVENT_NAMES: RealtimeEventName[] = [
  'media.moderated', 'moderation.queue.changed', 'review.visibility.changed',
  'account.updated', 'account.deactivated', 'activity.created',
  'media.rating.updated', 'review.created', 'list.created', 'list.updated',
  'list.deleted', 'list.item.added', 'list.item.removed',
];

/** Acción normalizada que se puede guardar de forma segura en Redux. */
export interface RealtimeEventEnvelope {
  event: RealtimeEventName;
  payload: RealtimeEventPayloads[RealtimeEventName];
  mediaItemId?: string;
  receivedAt: string;
}
