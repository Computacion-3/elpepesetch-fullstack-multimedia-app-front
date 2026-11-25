import type { SocketTicket } from '@/src/features/auth/domain/entities/socket-ticket';
import type { RealtimeRepository } from '../repositories/realtime.repository';

/** Inicia la conexión; cada handshake obtiene un ticket nuevo de un solo uso. */
export class ConnectRealtimeUseCase {
  constructor(private readonly repository: RealtimeRepository) {}
  execute(getTicket: () => Promise<SocketTicket>): void { this.repository.connect(getTicket); }
}
