import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { LibraryEntryResponseDto } from '../dtos/library.dto';
import { LibraryEntryMapper } from './library-entry.mapper';

const entryResponse: LibraryEntryResponseDto = {
  id: 'entry-uuid',
  status: 'IN_PROGRESS',
  progress: 42,
  rating: null,
  isFavorite: true,
  notes: 'Keep reading',
  startedAt: '2026-01-02T00:00:00.000Z',
  completedAt: null,
  addedAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  mediaItem: {
    id: 'media-uuid',
    title: 'A book',
    type: 'BOOK',
    description: null,
    releaseYear: 2024,
    creator: 'Author',
    coverUrl: 'https://example.test/cover.jpg',
    platform: null,
    durationMinutes: null,
    pages: 300,
    isbn: null,
    approvalStatus: 'APPROVED',
    rejectionReason: null,
    averageRating: 8.4,
    ratingsCount: 12,
    genres: [{ id: 'genre-uuid', name: 'Fiction', description: null }],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
};

describe('LibraryEntryMapper', () => {
  it('maps the API relation fields into a domain entry', () => {
    const entry = LibraryEntryMapper.toDomain(entryResponse);

    assert.equal(entry.id, 'entry-uuid');
    assert.equal(entry.mediaItemId, 'media-uuid');
    assert.equal(entry.status, 'IN_PROGRESS');
    assert.equal(entry.media.coverUrl, 'https://example.test/cover.jpg');
    assert.equal(entry.media.progressMaximum, 300);
    assert.deepEqual(entry.media.genreIds, ['genre-uuid']);
  });

  it('maps detail responses without a loaded genres relation', () => {
    const { genres, ...mediaItem } = entryResponse.mediaItem;
    void genres;
    const entry = LibraryEntryMapper.toDomain({
      ...entryResponse,
      mediaItem,
    });

    assert.deepEqual(entry.media.genreIds, []);
    assert.equal(entry.media.progressMaximum, 300);
  });
});
