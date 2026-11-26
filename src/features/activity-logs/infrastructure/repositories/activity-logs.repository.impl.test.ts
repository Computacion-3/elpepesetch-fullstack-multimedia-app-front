import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { HttpError } from '../../../../shared/infrastructure/http-client';
import { UnauthorizedError } from '../../../../shared/domain/errors';
import { ActivityLogsRepositoryImpl } from './activity-logs.repository.impl';

describe('ActivityLogsRepositoryImpl', () => {
  it('keeps authentication failures as errors instead of returning empty history', async () => {
    const repository = new ActivityLogsRepositoryImpl({ fetchMyActivity: async () => { throw new HttpError(401, 'Unauthorized'); } });
    await assert.rejects(repository.getMyActivity({ page: 1, limit: 10 }), UnauthorizedError);
  });
});
