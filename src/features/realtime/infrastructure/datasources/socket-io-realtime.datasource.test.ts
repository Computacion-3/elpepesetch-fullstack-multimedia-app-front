import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { SocketIoRealtimeDatasource } from './socket-io-realtime.datasource';

function createFakeSocket() {
  const handlers = new Map<string, Set<(...args: unknown[]) => void>>();
  const emitted: { event: string; payload: unknown }[] = [];
  const managerHandlers = new Map<string, Set<(...args: unknown[]) => void>>();
  const add = (map: Map<string, Set<(...args: unknown[]) => void>>, event: string, handler: (...args: unknown[]) => void) => {
    const listeners = map.get(event) ?? new Set();
    listeners.add(handler);
    map.set(event, listeners);
  };
  const socket = {
    active: true,
    on: (event: string, handler: (...args: unknown[]) => void) => { add(handlers, event, handler); return socket; },
    off: (event?: string, handler?: (...args: unknown[]) => void) => {
      if (!event) handlers.clear();
      else if (handler) handlers.get(event)?.delete(handler);
      else handlers.delete(event);
      return socket;
    },
    emit: (event: string, payload: unknown) => { emitted.push({ event, payload }); return socket; },
    connect: () => { for (const handler of handlers.get('connect') ?? []) handler(); return socket; },
    disconnect: () => { socket.active = false; return socket; },
    io: {
      on: (event: string, handler: (...args: unknown[]) => void) => add(managerHandlers, event, handler),
      off: (event?: string) => { if (event) managerHandlers.delete(event); else managerHandlers.clear(); },
    },
    trigger: (event: string, payload?: unknown) => { for (const handler of handlers.get(event) ?? []) handler(payload); },
    triggerManager: (event: string) => { for (const handler of managerHandlers.get(event) ?? []) handler(); },
    handlers,
    emitted,
  };
  return socket;
}

describe('SocketIoRealtimeDatasource', () => {
  it('renews the single-use handshake ticket and never adds it to the URL', async () => {
    const socket = createFakeSocket();
    let socketUrl = '';
    let socketOptions: { path: string; auth: (callback: (credentials: { token: string }) => void) => void } | undefined;
    const datasource = new SocketIoRealtimeDatasource((url, options) => {
      socketUrl = url;
      socketOptions = options;
      return socket as never;
    });
    const tickets = ['ticket-1', 'ticket-2'];
    const getTicket = async () => ({ token: tickets.shift() ?? 'ticket-next', expiresInSeconds: 60 });

    datasource.connect(getTicket);
    const credentials: string[] = [];
    await new Promise<void>((resolve) => socketOptions?.auth((value) => { credentials.push(value.token); resolve(); }));
    await new Promise<void>((resolve) => socketOptions?.auth((value) => { credentials.push(value.token); resolve(); }));

    assert.equal(socketUrl, 'http://localhost:3002');
    assert.equal(socketOptions?.path, '/socket.io');
    assert.deepEqual(credentials, ['ticket-1', 'ticket-2']);
  });

  it('forwards media-room messages, status and event payloads through its interface', () => {
    const socket = createFakeSocket();
    const datasource = new SocketIoRealtimeDatasource(() => socket as never);
    const statuses: string[] = [];
    const received: unknown[] = [];
    datasource.onStatus((status) => statuses.push(status));
    datasource.on('media.rating.updated', (payload) => received.push(payload));
    datasource.connect(async () => ({ token: 'ticket', expiresInSeconds: 60 }));
    const payload = { mediaItemId: 'media-1', averageRating: 8.2, ratingsCount: 4 };
    socket.trigger('media.rating.updated', payload);
    socket.triggerManager('reconnect_attempt');
    datasource.emit('media.subscribe', { mediaItemId: 'media-1' });

    assert.deepEqual(received, [payload]);
    assert.deepEqual(statuses, ['connecting', 'connected', 'reconnecting']);
    assert.deepEqual(socket.emitted, [{ event: 'media.subscribe', payload: { mediaItemId: 'media-1' } }]);
    datasource.off('media.rating.updated');
    assert.equal(socket.handlers.has('media.rating.updated'), false);
  });
});
