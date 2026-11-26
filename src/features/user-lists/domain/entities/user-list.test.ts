import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  assertValidUserListChanges,
  assertValidUserListDraft,
  UserList,
} from './user-list';

describe('UserList', () => {
  it('validates required names and 80/255 character limits', () => {
    assert.throws(
      () => assertValidUserListDraft({ name: '  ' }),
      /obligatorio/,
    );
    assert.throws(
      () => assertValidUserListDraft({ name: 'x'.repeat(81) }),
      /80 caracteres/,
    );
    assert.throws(
      () =>
        assertValidUserListDraft({ name: 'ok', description: 'x'.repeat(256) }),
      /255 caracteres/,
    );
    assert.doesNotThrow(() =>
      assertValidUserListDraft({
        name: 'x'.repeat(80),
        description: null,
        visibility: 'PRIVATE',
      }),
    );
  });

  it('validates partial changes and keeps a new immutable copy', () => {
    assert.throws(
      () => assertValidUserListChanges({ visibility: 'HIDDEN' as never }),
      /visibilidad/,
    );
    const original = new UserList({
      id: 'id',
      name: 'Favoritos',
      description: null,
      visibility: 'PRIVATE',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
      owner: { id: 1, username: 'ana' },
      items: [],
    });
    const updated = original.withChanges({ visibility: 'PUBLIC' });
    assert.equal(original.visibility, 'PRIVATE');
    assert.equal(updated.visibility, 'PUBLIC');
  });
});
