import type { RealtimeRepository } from '../repositories/realtime.repository';

/** Cierra la conexión y quita sus listeners al salir de la sesión. */
export class DisconnectRealtimeUseCase {
  constructor(private readonly repository: RealtimeRepository) {}
  execute(): void { this.repository.disconnect(); }
}
