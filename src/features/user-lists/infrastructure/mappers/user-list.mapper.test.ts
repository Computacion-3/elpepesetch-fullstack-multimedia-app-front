import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { UserListMapper } from './user-list.mapper';

describe('UserListMapper', () => {
  it('maps ownerUsername, media summaries, and numeric GraphQL ratings', () => {
    const list = UserListMapper.toDomain({
      id: 'list-id',
      name: 'Favoritos',
      description: null,
      visibility: 'PUBLIC',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
      owner: { id: 8, username: 'owner' },
      ownerUsername: 'ana',
      items: [
        {
          id: 'media-id',
          title: 'Libro',
          type: 'BOOK',
          coverUrl: null,
          releaseYear: 2024,
          creator: 'Autora',
          pages: 180,
          durationMinutes: null,
          platform: null,
          averageRating: '4.5',
          ratingsCount: 2,
          genres: [{ id: 'genre', name: 'Ficción' }],
        },
      ],
    });
    assert.equal(list.owner.username, 'ana');
    assert.equal(list.items[0].averageRating, 4.5);
    assert.deepEqual(list.items[0].genreIds, ['genre']);
  });
});
