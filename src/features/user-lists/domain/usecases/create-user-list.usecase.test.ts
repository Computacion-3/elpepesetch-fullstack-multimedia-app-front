import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { UserListsRepository } from '../repositories/user-lists.repository';
import { CreateUserListUseCase } from './create-user-list.usecase';

describe('CreateUserListUseCase', () => {
  it('validates before sending a request and passes valid drafts through', async () => {
    let calls = 0;
    const repository = {
      create: async (draft: { name: string }) => {
        calls += 1;
        return draft;
      },
    } as UserListsRepository;
    const useCase = new CreateUserListUseCase(repository);
    assert.throws(() => useCase.execute({ name: ' ' }), /obligatorio/);
    assert.equal(calls, 0);
    await useCase.execute({ name: 'Colección', visibility: 'PUBLIC' });
    assert.equal(calls, 1);
  });
});
