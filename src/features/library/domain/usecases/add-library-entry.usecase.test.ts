import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { LibraryRepository } from '../repositories/library.repository';
import { AddLibraryEntryUseCase } from './add-library-entry.usecase';

describe('AddLibraryEntryUseCase', () => {
  it('adds a catalog item using only its media identifier', async () => {
    let addCalls = 0;
    let received: unknown;
    const repository: Pick<LibraryRepository, 'add'> = {
      add: async (params) => {
        addCalls += 1;
        received = params;
        return {} as Awaited<ReturnType<LibraryRepository['add']>>;
      },
    };
    const useCase = new AddLibraryEntryUseCase(repository);

    await useCase.execute({ mediaItemId: 'media-movie-02' });
    assert.equal(addCalls, 1);
    assert.deepEqual(received, { mediaItemId: 'media-movie-02' });
  });
});
