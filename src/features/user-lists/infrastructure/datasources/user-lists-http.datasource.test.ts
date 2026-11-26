import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { HttpClient } from '@/src/shared/infrastructure/http-client';
import { UserListsHttpDatasource } from './user-lists-http.datasource';

describe('UserListsHttpDatasource', () => {
  it('uses contract routes and returns successful 204 mutations', async () => {
    const calls: [string, string, unknown, string | undefined][] = [];
    const http: HttpClient = {
      get: async (path, token) => {
        calls.push(['GET', path, undefined, token]);
        return {
          data: [],
          meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
        } as never;
      },
      post: async (path, body, token) => {
        calls.push(['POST', path, body, token]);
        return {} as never;
      },
      patch: async (path, body, token) => {
        calls.push(['PATCH', path, body, token]);
        return {} as never;
      },
      put: async () => {
        throw new Error('unused');
      },
      delete: async (path, token) => {
        calls.push(['DELETE', path, undefined, token]);
        return undefined as never;
      },
    };
    const datasource = new UserListsHttpDatasource(http, 'session-token');
    await datasource.getMyLists();
    await datasource.getPublicLists({ page: 2, limit: 10 });
    await datasource.getById('list/id');
    await datasource.create({ name: 'Favoritos', visibility: 'PRIVATE' });
    await datasource.update('list/id', { description: null });
    await datasource.addItem('list/id', 'media/id');
    assert.equal(await datasource.delete('list/id'), true);
    assert.equal(await datasource.removeItem('list/id', 'media/id'), true);
    assert.deepEqual(
      calls.map(([method, path]) => [method, path]),
      [
        ['GET', '/lists'],
        ['GET', '/lists/public?page=2&limit=10'],
        ['GET', '/lists/list%2Fid'],
        ['POST', '/lists'],
        ['PATCH', '/lists/list%2Fid'],
        ['POST', '/lists/list%2Fid/items'],
        ['DELETE', '/lists/list%2Fid'],
        ['DELETE', '/lists/list%2Fid/items/media%2Fid'],
      ],
    );
    assert.deepEqual(calls[3][2], { name: 'Favoritos', visibility: 'PRIVATE' });
    assert.deepEqual(calls[4][2], { description: null });
    assert.deepEqual(calls[5][2], { mediaItemId: 'media/id' });
    assert.ok(calls.every(([, , , token]) => token === 'session-token'));
  });
});
