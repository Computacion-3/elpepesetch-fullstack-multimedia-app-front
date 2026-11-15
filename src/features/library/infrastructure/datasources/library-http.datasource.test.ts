import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { LibraryApiClient } from './library-http.datasource';
import { LibraryHttpDatasource } from './library-http.datasource';

describe('LibraryHttpDatasource', () => {
  it('serializes filters as query strings, including false booleans', async () => {
    let requestPath = '';
    let requestQuery: URLSearchParams | undefined;
    const client: LibraryApiClient = {
      async request<T>(
        path: string,
        options?: {
          method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
          query?: URLSearchParams;
          body?: unknown;
        },
      ): Promise<T> {
        requestPath = path;
        requestQuery = options?.query;
        return {
          data: [],
          meta: { total: 0, page: 2, limit: 10, totalPages: 0 },
        } as unknown as T;
      },
    };
    const datasource = new LibraryHttpDatasource(client);

    const result = await datasource.fetchEntries({
      isFavorite: false,
      type: 'BOOK',
      page: 2,
      limit: 10,
    });

    assert.equal(requestPath, '/library');
    assert.equal(requestQuery?.get('isFavorite'), 'false');
    assert.equal(requestQuery?.get('type'), 'BOOK');
    assert.equal(requestQuery?.get('page'), '2');
    assert.deepEqual(result.meta, {
      total: 0,
      page: 2,
      limit: 10,
      totalPages: 0,
    });
  });
});
