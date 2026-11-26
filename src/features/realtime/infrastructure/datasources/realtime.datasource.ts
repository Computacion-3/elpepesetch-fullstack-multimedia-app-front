import type { SocketTicket } from '@/src/features/auth/domain/entities/socket-ticket';
import type { RealtimeConnectionStatus, RealtimeEventName } from '../../domain/entities/realtime-event';

/** Interfaz reemplazable para probar el transporte sin abrir un socket real. */
export interface IRealtimeDatasource {
  connect(getTicket: () => Promise<SocketTicket>): void;
  disconnect(): void;
  on(event: RealtimeEventName, handler: (payload: unknown) => void): void;
  off(event: RealtimeEventName): void;
  onStatus(handler: (status: RealtimeConnectionStatus) => void): void;
  clearStatusHandlers(): void;
  emit(event: 'media.subscribe' | 'media.unsubscribe', payload: { mediaItemId: string }): void;
}
