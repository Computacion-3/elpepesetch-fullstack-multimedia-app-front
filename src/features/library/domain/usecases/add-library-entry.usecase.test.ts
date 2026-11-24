import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ValidationError } from '../../../../shared/domain/errors';
import type { LibraryRepository } from '../repositories/library.repository';
import { AddLibraryEntryUseCase } from './add-library-entry.usecase';

describe('AddLibraryEntryUseCase', () => {
  it('rejects invalid initial state before calling the repository', async () => {
    let addCalls = 0;
    const repository: Pick<LibraryRepository, 'add'> = {
      add: async () => {
        addCalls += 1;
        throw new Error('Repository must not run for an invalid entry.');
      },
    };
    const useCase = new AddLibraryEntryUseCase(repository);

    await assert.rejects(
      useCase.execute({ mediaItemId: 'media-movie-02', rating: 8 }),
      ValidationError,
    );
    assert.equal(addCalls, 0);
  });
});
