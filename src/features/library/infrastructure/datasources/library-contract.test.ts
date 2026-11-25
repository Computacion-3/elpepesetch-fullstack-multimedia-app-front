import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { GraphQLClient } from '@/src/shared/infrastructure/graphql-client';
import type { LibraryApiClient } from './library-http.datasource';
import { LibraryGraphQLDatasource } from './library-graphql.datasource';
import { LibraryHttpDatasource } from './library-http.datasource';
import type { LibraryDatasource } from './library.datasource';
import type { LibraryEntryResponseDto } from '../dtos/library.dto';

const entry: LibraryEntryResponseDto = {
  id: 'entry-1', status: 'IN_PROGRESS', progress: 5, rating: 8, isFavorite: true,
  notes: 'seguir', addedAt: '2026-11-20T00:00:00.000Z',
  mediaItem: {
    id: 'media-1', title: 'Catálogo', type: 'BOOK', releaseYear: 2020,
    creator: 'Autora', coverUrl: null, pages: 100, durationMinutes: null,
    averageRating: 8.4, ratingsCount: 3, genres: [{ id: 'genre-1', name: 'Ficción' }],
  },
};
const page = { data: [entry], meta: { total: 1, page: 1, limit: 10, totalPages: 1 } };

function createDatasources(): { name: string; datasource: LibraryDatasource }[] {
  const restClient: LibraryApiClient = {
    async request<T>(path: string, options?: { method?: 'GET' | 'POST' | 'PATCH' | 'DELETE' }): Promise<T> {
      if (path === '/library' && options?.method === 'GET') return page as T;
      if (path === '/library' && options?.method === 'POST') return entry as T;
      if (path.startsWith('/library/') && options?.method === 'GET') return entry as T;
      if (path.startsWith('/library/') && options?.method === 'PATCH') return entry as T;
      return undefined as T;
    },
  };
  const graphqlClient: GraphQLClient = {
    async execute<T>(document: string): Promise<T> {
      if (document.includes('myLibrary')) return { myLibrary: page } as T;
      if (document.includes('libraryEntry(')) return { libraryEntry: entry } as T;
      if (document.includes('addToLibrary')) return { addToLibrary: entry } as T;
      if (document.includes('updateLibraryEntry')) return { updateLibraryEntry: entry } as T;
      return { removeLibraryEntry: true } as T;
    },
  };
  return [
    { name: 'REST', datasource: new LibraryHttpDatasource(restClient) },
    { name: 'GraphQL', datasource: new LibraryGraphQLDatasource(graphqlClient, 'session') },
  ];
}

describe('LibraryDatasource contract parity', () => {
  for (const { name, datasource } of createDatasources()) {
    it(`${name} returns the same page and CRUD response shapes`, async () => {
      assert.deepEqual(await datasource.fetchEntries({ page: 1, limit: 10 }), page);
      assert.deepEqual(await datasource.fetchEntry('entry-1'), entry);
      assert.deepEqual(await datasource.createEntry({ mediaItemId: 'media-1' }), { kind: 'created', entry });
      assert.deepEqual(await datasource.updateEntry('entry-1', { progress: 5 }), entry);
      assert.equal(await datasource.deleteEntry('entry-1'), true);
    });
  }
});
