import type { RealtimeRepository } from '../../domain/repositories/realtime.repository';
import type { IRealtimeDatasource } from '../datasources/realtime.datasource';

/** Reenvía las operaciones del puerto de dominio al datasource socket. */
export class RealtimeRepositoryImpl implements RealtimeRepository {
  constructor(private readonly datasource: IRealtimeDatasource) {}
  connect(getTicket: Parameters<IRealtimeDatasource['connect']>[0]) { this.datasource.connect(getTicket); }
  disconnect() { this.datasource.disconnect(); }
  on(event: Parameters<IRealtimeDatasource['on']>[0], handler: Parameters<IRealtimeDatasource['on']>[1]) { this.datasource.on(event, handler); }
  off(event: Parameters<IRealtimeDatasource['off']>[0]) { this.datasource.off(event); }
  onStatus(handler: Parameters<IRealtimeDatasource['onStatus']>[0]) { this.datasource.onStatus(handler); }
  clearStatusHandlers() { this.datasource.clearStatusHandlers(); }
  emit(event: Parameters<IRealtimeDatasource['emit']>[0], payload: Parameters<IRealtimeDatasource['emit']>[1]) { this.datasource.emit(event, payload); }
}
