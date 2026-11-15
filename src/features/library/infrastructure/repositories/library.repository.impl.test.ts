import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  ValidationError,
  NotFoundError,
  ConflictError,
} from '../../../../shared/domain/errors';
import { LibraryMockDatasource } from '../datasources/library-mock.datasource';
import { LibraryRepositoryImpl } from './library.repository.impl';

describe('LibraryRepositoryImpl with the temporary datasource', () => {
  it('does not persist an invalid update', async () => {
    const datasource = new LibraryMockDatasource();
    const repository = new LibraryRepositoryImpl(datasource);

    await assert.rejects(
      repository.update('entry-01', { progress: -2 }),
      ValidationError,
    );
    assert.equal((await datasource.fetchEntry('entry-01'))?.progress, 14);
  });

  it('rejects duplicate and unavailable media without changing the collection', async () => {
    const datasource = new LibraryMockDatasource();
    const repository = new LibraryRepositoryImpl(datasource);
    const before = await repository.getAll({ page: 1, limit: 50 });

    await assert.rejects(
      repository.add({ mediaItemId: 'media-game-01' }),
      ConflictError,
    );
    await assert.rejects(
      repository.add({ mediaItemId: 'unknown-media' }),
      NotFoundError,
    );
    const after = await repository.getAll({ page: 1, limit: 50 });
    assert.equal(after.meta.total, before.meta.total);
  });

  it('adds an available media item and removes it from the selector options', async () => {
    const datasource = new LibraryMockDatasource();
    const repository = new LibraryRepositoryImpl(datasource);
    const added = await repository.add({ mediaItemId: 'media-movie-02' });

    assert.equal(added.media.title, 'Perfect Days');
    assert.equal(
      (await repository.getAll({ page: 1, limit: 50 })).meta.total,
      6,
    );
    assert.equal(
      (await datasource.fetchSelectableItems()).some(
        (item) => item.id === 'media-movie-02',
      ),
      false,
    );
  });

  it('filters, sorts, and paginates the collection', async () => {
    const repository = new LibraryRepositoryImpl(new LibraryMockDatasource());
    const filtered = await repository.getAll({
      q: 'denis',
      status: 'COMPLETED',
      page: 1,
      limit: 10,
    });
    assert.deepEqual(
      filtered.data.map((entry) => entry.media.title),
      ['Arrival'],
    );

    const page = await repository.getAll({
      sortBy: 'title',
      order: 'ASC',
      page: 1,
      limit: 2,
    });
    assert.deepEqual(
      page.data.map((entry) => entry.media.title),
      ['Arrival', 'Celeste'],
    );
    assert.deepEqual(page.meta, { total: 5, page: 1, limit: 2, totalPages: 3 });
  });

  it('reports missing entries without mutating the collection', async () => {
    const repository = new LibraryRepositoryImpl(new LibraryMockDatasource());
    await assert.rejects(repository.remove('missing-entry'), NotFoundError);
  });

  it('removes an existing entry', async () => {
    const datasource = new LibraryMockDatasource();
    const repository = new LibraryRepositoryImpl(datasource);
    await repository.remove('entry-01');
    assert.equal(await datasource.fetchEntry('entry-01'), null);
  });
});
