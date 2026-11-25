import type { RealtimeEventName } from '../entities/realtime-event';
import type { RealtimeRepository } from '../repositories/realtime.repository';

/** Registra el mismo handler para cada evento que publica el backend. */
export class SubscribeRealtimeEventsUseCase {
  constructor(private readonly repository: RealtimeRepository) {}
  execute(events: readonly RealtimeEventName[], handler: (event: RealtimeEventName, payload: unknown) => void): void {
    for (const event of events) this.repository.on(event, (payload) => handler(event, payload));
  }
}
