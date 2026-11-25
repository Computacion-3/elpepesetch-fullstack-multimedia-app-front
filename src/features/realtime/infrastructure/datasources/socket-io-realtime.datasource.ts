import { io } from 'socket.io-client';
import type { SocketTicket } from '@/src/features/auth/domain/entities/socket-ticket';
import { REALTIME_EVENT_NAMES, type RealtimeConnectionStatus, type RealtimeEventName } from '../../domain/entities/realtime-event';
import type { IRealtimeDatasource } from './realtime.datasource';

type SocketAdapter = {
  active: boolean;
  on(event: string, handler: (...args: unknown[]) => void): SocketAdapter;
  off(event?: string, handler?: (...args: unknown[]) => void): SocketAdapter;
  emit(event: string, payload: unknown): SocketAdapter;
  connect(): SocketAdapter;
  disconnect(): SocketAdapter;
  io: {
    on(event: string, handler: (...args: unknown[]) => void): void;
    off(event?: string, handler?: (...args: unknown[]) => void): void;
  };
};

type SocketOptions = {
  path: string;
  autoConnect: false;
  reconnection: true;
  reconnectionDelay: number;
  reconnectionDelayMax: number;
  auth: (callback: (credentials: { token: string }) => void) => void;
};

type SocketFactory = (url: string, options: SocketOptions) => SocketAdapter;

/** Socket.IO se limita a este datasource; ningún componente ni slice carga el SDK. */
export class SocketIoRealtimeDatasource implements IRealtimeDatasource {
  private socket: SocketAdapter | null = null;
  private hasConnected = false;
  private readonly eventHandlers = new Map<RealtimeEventName, Set<(payload: unknown) => void>>();
  private readonly statusHandlers = new Set<(status: RealtimeConnectionStatus) => void>();

  constructor(private readonly createSocket: SocketFactory = io as unknown as SocketFactory) {}

  connect(getTicket: () => Promise<SocketTicket>): void {
    if (this.socket?.active) return;
    this.notifyStatus(this.hasConnected ? 'reconnecting' : 'connecting');

    const url = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3002';
    const options: SocketOptions = {
      path: '/socket.io',
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
      // Socket.IO llama este callback en cada handshake, también en las reconexiones.
      auth: (callback) => {
        void getTicket().then(
          (ticket) => callback({ token: ticket.token }),
          () => callback({ token: '' }),
        );
      },
    };

    this.socket = this.createSocket(url, options);
    this.attachHandlers(this.socket);
    this.socket.connect();
  }

  disconnect(): void {
    const socket = this.socket;
    if (socket) {
      for (const event of REALTIME_EVENT_NAMES) socket.off(event);
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.io.off('reconnect_attempt');
      socket.io.off('reconnect');
      socket.disconnect();
    }
    this.socket = null;
    this.hasConnected = false;
    this.eventHandlers.clear();
    this.clearStatusHandlers();
    this.notifyStatus('disconnected');
  }

  on(event: RealtimeEventName, handler: (payload: unknown) => void): void {
    const handlers = this.eventHandlers.get(event) ?? new Set();
    handlers.add(handler);
    this.eventHandlers.set(event, handlers);
    this.socket?.on(event, handler);
  }

  off(event: RealtimeEventName): void {
    this.socket?.off(event);
    this.eventHandlers.delete(event);
  }

  onStatus(handler: (status: RealtimeConnectionStatus) => void): void {
    this.statusHandlers.add(handler);
  }

  clearStatusHandlers(): void {
    this.statusHandlers.clear();
  }

  emit(event: 'media.subscribe' | 'media.unsubscribe', payload: { mediaItemId: string }): void {
    this.socket?.emit(event, payload);
  }

  private attachHandlers(socket: SocketAdapter): void {
    for (const [event, handlers] of this.eventHandlers) {
      for (const handler of handlers) socket.on(event, handler);
    }
    socket.on('connect', () => {
      this.hasConnected = true;
      this.notifyStatus('connected');
    });
    socket.on('disconnect', () => {
      this.notifyStatus('reconnecting');
    });
    socket.on('connect_error', () => {
      this.notifyStatus(this.hasConnected ? 'reconnecting' : 'connecting');
    });
    socket.io.on('reconnect_attempt', () => {
      this.notifyStatus(this.hasConnected ? 'reconnecting' : 'connecting');
    });
    socket.io.on('reconnect', () => this.notifyStatus('connected'));
  }

  private notifyStatus(status: RealtimeConnectionStatus): void {
    for (const handler of this.statusHandlers) handler(status);
  }
}
