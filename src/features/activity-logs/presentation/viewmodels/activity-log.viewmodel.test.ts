import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ActivityLogViewModelMapper } from './activity-log.viewmodel';

describe('ActivityLogViewModelMapper', () => {
  it('uses metadata safely and renders a fallback for unknown actions', () => {
    const base = { id: 'a', metadata: null, createdAt: 'invalid-date', mediaItem: null };
    assert.equal(ActivityLogViewModelMapper.toViewModel({ ...base, action: 'PROGRESS_UPDATED' }).context, null);
    const unknown = ActivityLogViewModelMapper.toViewModel({ ...base, action: 'FUTURE_ACTION' });
    assert.equal(unknown.description, 'Realizaste una actividad.');
    assert.equal(unknown.dateLabel, 'Fecha no disponible');
  });

  it('explains valid status metadata', () => {
    const result = ActivityLogViewModelMapper.toViewModel({ id: 'a', action: 'STATUS_CHANGED', metadata: { previousStatus: 'PLANNED', status: 'ACTIVE' }, createdAt: '2026-10-03T18:30:00.000Z', mediaItem: null });
    assert.equal(result.context, 'PLANNED → ACTIVE');
  });

  it('renders every known activity and safely handles favorite metadata', () => {
    const actions = [
      ['ENTRY_ADDED', 'Agregaste un medio a tu biblioteca.'],
      ['STATUS_CHANGED', 'Cambiaste el estado de un medio.'],
      ['PROGRESS_UPDATED', 'Actualizaste el progreso de un medio.'],
      ['ENTRY_COMPLETED', 'Completaste un medio.'],
      ['REVIEW_CREATED', 'Creaste una reseña.'],
      ['LIST_CREATED', 'Creaste una lista.'],
    ] as const;
    for (const [action, description] of actions) {
      const result = ActivityLogViewModelMapper.toViewModel({ id: action, action, metadata: null, createdAt: '2026-10-03T18:30:00.000Z', mediaItem: null });
      assert.equal(result.description, description);
    }
    const favorite = ActivityLogViewModelMapper.toViewModel({ id: 'favorite', action: 'FAVORITE_TOGGLED', metadata: { isFavorite: true }, createdAt: '2026-10-03T18:30:00.000Z', mediaItem: null });
    assert.equal(favorite.description, 'Marcaste un medio como favorito.');
  });
});
