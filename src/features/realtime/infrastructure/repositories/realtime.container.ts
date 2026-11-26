import { ConnectRealtimeUseCase } from '../../domain/usecases/connect-realtime.usecase';
import { DisconnectRealtimeUseCase } from '../../domain/usecases/disconnect-realtime.usecase';
import { SubscribeRealtimeEventsUseCase } from '../../domain/usecases/subscribe-realtime-events.usecase';
import { RealtimeRepositoryImpl } from './realtime.repository.impl';
import { SocketIoRealtimeDatasource } from '../datasources/socket-io-realtime.datasource';

/** Composition root del cliente; crear el contenedor no abre la conexión. */
export function createRealtimeContainer() {
  const repository = new RealtimeRepositoryImpl(new SocketIoRealtimeDatasource());
  return {
    connect: new ConnectRealtimeUseCase(repository),
    disconnect: new DisconnectRealtimeUseCase(repository),
    subscribeEvents: new SubscribeRealtimeEventsUseCase(repository),
    repository,
  };
}
