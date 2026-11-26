import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createUserList, userListsSlice } from './user-lists.slice';
import type { UserListViewModel } from '../viewmodels/user-list.viewmodel';

const list: UserListViewModel = {
  id: 'list-id',
  name: 'Favoritos',
  description: null,
  visibility: 'PRIVATE',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  owner: { id: 1, username: 'ana' },
  items: [],
};

describe('userListsSlice', () => {
  it('does not confirm a list until create succeeds', () => {
    const initial = userListsSlice.reducer(
      undefined,
      createUserList.pending('request', { name: 'Favoritos' }),
    );
    assert.equal(initial.ownLists.length, 0);
    const saved = userListsSlice.reducer(
      initial,
      createUserList.fulfilled(list, 'request', { name: 'Favoritos' }),
    );
    assert.deepEqual(saved.ownLists, [list]);
  });
});
