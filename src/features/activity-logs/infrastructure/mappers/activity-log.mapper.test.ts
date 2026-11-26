import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ActivityLogMapper } from './activity-log.mapper';

describe('ActivityLogMapper', () => {
  it('normalizes null media and malformed metadata without inventing values', () => {
    const result = ActivityLogMapper.toDomain({ id: 'id', action: 'ENTRY_ADDED', metadata: ['unexpected'], createdAt: '2026-10-03T18:30:00.000Z' });
    assert.equal(result.mediaItem, null);
    assert.equal(result.metadata, null);
  });
});
