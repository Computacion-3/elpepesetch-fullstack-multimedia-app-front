import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { GraphQLClient } from '../../../../shared/infrastructure/graphql-client';
import { LibraryGraphQLDatasource } from './library-graphql.datasource';

describe('LibraryGraphQLDatasource', () => {
  it('maps the sort value and forwards declared query filters', async () => {
    let request: { document: string; variables?: Record<string, unknown> } | undefined;
    const client: GraphQLClient = {
      async execute<T>(document: string, variables?: Record<string, unknown>) {
        request = { document, variables };
        return { myLibrary: { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } } } as T;
      },
    };
    const datasource = new LibraryGraphQLDatasource(client);

    await datasource.fetchEntries({ q: 'arrival', sortBy: 'releaseYear', order: 'DESC', page: 2, limit: 10 });

    assert.match(request?.document ?? '', /myLibrary\(filter: \$filter\)/);
    assert.deepEqual(request?.variables, {
      filter: { q: 'arrival', sortBy: 'RELEASE_YEAR', order: 'DESC', page: 2, limit: 10 },
    });
  });
});
