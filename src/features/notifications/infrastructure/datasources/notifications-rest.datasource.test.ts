import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { HttpClient } from '@/src/shared/infrastructure/http-client';
import { NotificationsRestDatasource } from './notifications-rest.datasource';

describe('NotificationsRestDatasource', () => {
  it('sends the read filter and the current session token', async () => {
    let requestedPath = '';
    let requestedToken = '';
    const http = {
      get: async <T>(path: string, token?: string) => {
        requestedPath = path;
        requestedToken = token ?? '';
        return { data: [], meta: { total: 0, page: 2, limit: 5, totalPages: 0 } } as T;
      },
    } as unknown as HttpClient;
    const datasource = new NotificationsRestDatasource(http, 'session');

    const page = await datasource.fetch({ page: 2, limit: 5, isRead: false });

    assert.equal(requestedPath, '/notifications?page=2&limit=5&isRead=false');
    assert.equal(requestedToken, 'session');
    assert.equal(page.meta.page, 2);
  });

  it('marks only the selected notification as read', async () => {
    let requestedPath = '';
    const http = {
      patch: async <T>(path: string, _body: unknown, token?: string) => {
        requestedPath = `${path}:${token}`;
        return { id: 'notice-1', eventId: 'event-1', type: 'ROLE_CHANGED', payload: {}, isRead: true, createdAt: '2026-11-25T00:00:00.000Z' } as T;
      },
    } as unknown as HttpClient;
    const datasource = new NotificationsRestDatasource(http, 'session');

    const notification = await datasource.markRead('notice-1');

    assert.equal(requestedPath, '/notifications/notice-1/read:session');
    assert.equal(notification.isRead, true);
  });
});
