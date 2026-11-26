import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { GraphQLClient } from '@/src/shared/infrastructure/graphql-client';
import { UserListsGraphQLDatasource } from './user-lists-graphql.datasource';

describe('UserListsGraphQLDatasource', () => {
  it('uses declared operations, arguments, and authenticated token', async () => {
    const calls: {
      document: string;
      variables?: Record<string, unknown>;
      token?: string;
    }[] = [];
    const graph: GraphQLClient = {
      execute: async (document, variables, token) => {
        calls.push({ document, variables, token });
        const field = document.match(/\{\s*(\w+)/)?.[1];
        return {
          [field ?? '']:
            field === 'publicLists'
              ? {
                  data: [],
                  meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
                }
              : true,
        } as never;
      },
    };
    const datasource = new UserListsGraphQLDatasource(graph, 'session-token');
    await datasource.getMyLists();
    await datasource.getPublicLists({ page: 1, limit: 10 });
    await datasource.getById('list-id');
    await datasource.create({ name: 'Favoritos', visibility: 'PRIVATE' });
    await datasource.update('list-id', { description: null });
    await datasource.delete('list-id');
    await datasource.addItem('list-id', 'media-id');
    await datasource.removeItem('list-id', 'media-id');
    assert.match(calls[0].document, /myLists/);
    assert.deepEqual(calls[1].variables, { filter: { page: 1, limit: 10 } });
    assert.deepEqual(calls[2].variables, { id: 'list-id' });
    assert.deepEqual(calls[3].variables, { input: { name: 'Favoritos', visibility: 'PRIVATE' } });
    assert.deepEqual(calls[4].variables, { id: 'list-id', input: { description: null } });
    assert.deepEqual(calls[5].variables, { id: 'list-id' });
    assert.deepEqual(calls[6].variables, { listId: 'list-id', input: { mediaItemId: 'media-id' } });
    assert.deepEqual(calls[7].variables, { listId: 'list-id', mediaItemId: 'media-id' });
    assert.ok(calls.every((call) => call.token === 'session-token'));
  });
});
