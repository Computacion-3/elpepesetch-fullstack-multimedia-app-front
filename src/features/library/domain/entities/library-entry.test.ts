import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { LibraryEntry } from './library-entry';

const media = {
  id: 'media-1',
  title: 'Sample book',
  type: 'BOOK' as const,
  creator: 'Writer',
  releaseYear: 2020,
  cover: 'SB',
  genreIds: [],
  progressMaximum: 200,
};

function entry(
  overrides: Partial<ConstructorParameters<typeof LibraryEntry>[0]> = {},
) {
  return new LibraryEntry({
    id: 'entry-1',
    mediaItemId: media.id,
    media,
    status: 'IN_PROGRESS',
    progress: 0,
    rating: null,
    isFavorite: false,
    notes: null,
    startedAt: null,
    completedAt: null,
    addedAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  });
}

describe('LibraryEntry', () => {
  it('rejects negative and fractional progress', () => {
    assert.throws(
      () => entry({ progress: -1 }),
      /entero igual o mayor que cero/,
    );
    assert.throws(
      () => entry({ progress: 1.5 }),
      /entero igual o mayor que cero/,
    );
  });

  it('allows zero progress and progress with no invented maximum', () => {
    assert.equal(entry({ progress: 0 }).progress, 0);
    assert.equal(
      entry({ media: { ...media, progressMaximum: undefined }, progress: 900 })
        .progress,
      900,
    );
  });

  it('accepts null or integer ratings from one through ten', () => {
    assert.equal(entry({ rating: null }).rating, null);
    assert.equal(entry({ rating: 1 }).rating, 1);
    assert.equal(entry({ rating: 10 }).rating, 10);
  });

  it('rejects out of range, fractional, and pending ratings', () => {
    for (const rating of [0, 11, 2.5]) {
      assert.throws(() => entry({ rating }), /calificación/);
    }
    assert.throws(() => entry({ status: 'PENDING', rating: 7 }), /pendiente/);
    assert.throws(
      () => entry({ rating: 7 }).withChanges({ status: 'PENDING' }),
      /pendiente/,
    );
  });

  it('returns validated copies for status, progress, favorite, rating, and notes updates', () => {
    const original = entry();
    const updated = original.withChanges({
      status: 'COMPLETED',
      progress: 200,
      rating: 9,
      isFavorite: true,
      notes: 'Finished',
    });
    assert.equal(original.progress, 0);
    assert.deepEqual(
      [
        updated.status,
        updated.progress,
        updated.rating,
        updated.isFavorite,
        updated.notes,
      ],
      ['COMPLETED', 200, 9, true, 'Finished'],
    );
  });
});
