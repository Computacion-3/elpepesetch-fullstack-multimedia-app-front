import type { SocketTicket } from '@/src/features/auth/domain/entities/socket-ticket';
import type { RealtimeConnectionStatus, RealtimeEventName } from '../entities/realtime-event';

/** Puerto de conexión; la capa de dominio no conoce Socket.IO ni el navegador. */
export interface RealtimeRepository {
  connect(getTicket: () => Promise<SocketTicket>): void;
  disconnect(): void;
  on(event: RealtimeEventName, handler: (payload: unknown) => void): void;
  off(event: RealtimeEventName): void;
  onStatus(handler: (status: RealtimeConnectionStatus) => void): void;
  clearStatusHandlers(): void;
  emit(event: 'media.subscribe' | 'media.unsubscribe', payload: { mediaItemId: string }): void;
}
