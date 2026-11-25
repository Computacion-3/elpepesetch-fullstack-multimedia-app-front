import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { GraphQLClient } from '../../../shared/infrastructure/graphql-client';
import type { LibraryApiClient } from '../infrastructure/datasources/library-http.datasource';
import { createLibraryContainer } from './library.container';

const httpClient: LibraryApiClient = { request: async <T>() => undefined as T };
const graphqlClient: GraphQLClient = { execute: async <T>() => undefined as T };

describe('Library dependency selection', () => {
  it('defaults to REST and requires the shared HTTP transport', () => {
    const configuredSource = process.env.NEXT_PUBLIC_DATA_SOURCE;
    delete process.env.NEXT_PUBLIC_DATA_SOURCE;
    try {
      assert.throws(() => createLibraryContainer({}), /cliente HTTP compartido/);
    } finally {
      if (configuredSource !== undefined) process.env.NEXT_PUBLIC_DATA_SOURCE = configuredSource;
    }
    assert.throws(() => createLibraryContainer({ dataSource: 'rest' }), /cliente HTTP compartido/);
    assert.ok(createLibraryContainer({ dataSource: 'rest', httpClient }).getLibrary);
  });

  it('selects GraphQL and requires the shared GraphQL transport', () => {
    assert.throws(() => createLibraryContainer({ dataSource: 'graphql' }), /cliente GraphQL compartido/);
    assert.ok(createLibraryContainer({ dataSource: 'graphql', graphqlClient }).getLibrary);
  });

  it('rejects invalid source values descriptively', () => {
    assert.throws(
      () => createLibraryContainer({ dataSource: 'mock', httpClient, graphqlClient }),
      /NEXT_PUBLIC_DATA_SOURCE inválido.*rest.*graphql/,
    );
  });
});
