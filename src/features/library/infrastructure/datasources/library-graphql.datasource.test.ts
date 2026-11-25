import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { GraphQLClient } from '@/src/shared/infrastructure/graphql-client';
import type { LibraryEntryResponseDto } from '../dtos/library.dto';
import { LibraryGraphQLDatasource } from './library-graphql.datasource';

const entry: LibraryEntryResponseDto = {
  id: 'entry-id',
  status: 'IN_PROGRESS',
  progress: 3,
  rating: null,
  isFavorite: false,
  notes: null,
  addedAt: '2026-11-25T00:00:00.000Z',
  updatedAt: '2026-11-25T00:00:00.000Z',
  mediaItem: {
    id: 'media-id',
    title: 'Libro',
    type: 'BOOK',
    releaseYear: 2020,
    creator: 'Autora',
    coverUrl: null,
    pages: 100,
    durationMinutes: null,
    averageRating: 8.5,
    ratingsCount: 2,
  },
};

describe('LibraryGraphQLDatasource', () => {
  it('uses the GraphQL contract and forwards the authenticated token', async () => {
    const calls: { document: string; variables?: Record<string, unknown>; token?: string }[] = [];
    const client: GraphQLClient = {
      async execute<T>(document: string, variables?: Record<string, unknown>, token?: string): Promise<T> {
        calls.push({ document, variables, token });
        let response: unknown;
        if (document.includes('myLibrary')) {
          response = { myLibrary: { data: [entry], meta: { total: 1, page: 1, limit: 10, totalPages: 1 } } };
        } else if (document.includes('libraryEntry(')) response = { libraryEntry: entry };
        else if (document.includes('addToLibrary')) response = { addToLibrary: entry };
        else if (document.includes('updateLibraryEntry')) response = { updateLibraryEntry: entry };
        else response = { removeLibraryEntry: true };
        return response as T;
      },
    };
    const datasource = new LibraryGraphQLDatasource(client, 'session-token');

    const page = await datasource.fetchEntries({ page: 1, limit: 10, isFavorite: false });
    const found = await datasource.fetchEntry('entry-id');
    const created = await datasource.createEntry({ mediaItemId: 'media-id' });
    const updated = await datasource.updateEntry('entry-id', { progress: 4 });
    const removed = await datasource.deleteEntry('entry-id');

    assert.deepEqual(page.meta, { total: 1, page: 1, limit: 10, totalPages: 1 });
    assert.equal(page.data[0].mediaItem.id, 'media-id');
    assert.equal(found?.id, 'entry-id');
    assert.equal(created.kind, 'created');
    assert.equal(updated?.id, 'entry-id');
    assert.equal(removed, true);
    assert.equal(calls.length, 5);
    assert.ok(calls.every((call) => call.token === 'session-token'));
    assert.deepEqual(calls[0].variables, { filter: { page: 1, limit: 10, isFavorite: false } });
    assert.deepEqual(calls[2].variables, { input: { mediaItemId: 'media-id' } });
    assert.deepEqual(calls[3].variables, { id: 'entry-id', input: { progress: 4 } });
  });

  it('maps the domain sort value to its GraphQL enum name', async () => {
    let filter: unknown;
    const client: GraphQLClient = {
      async execute<T>(_document: string, variables?: Record<string, unknown>): Promise<T> {
        filter = variables?.filter;
        return { myLibrary: { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } } } as T;
      },
    };
    await new LibraryGraphQLDatasource(client, 'session-token').fetchEntries({ sortBy: 'addedAt', order: 'DESC', page: 1, limit: 10 });
    assert.deepEqual(filter, { sortBy: 'ADDED_AT', order: 'DESC', page: 1, limit: 10 });
  });
});
