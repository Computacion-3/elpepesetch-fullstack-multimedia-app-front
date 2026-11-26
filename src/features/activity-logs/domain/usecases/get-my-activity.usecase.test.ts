import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { ActivityQuery } from '../entities/activity-log';
import { GetMyActivityUseCase } from './get-my-activity.usecase';

describe('GetMyActivityUseCase', () => {
  it('defaults to the first page and backend limit', async () => {
    let received: ActivityQuery | undefined;
    const useCase = new GetMyActivityUseCase({ getMyActivity: async (query) => {
      received = query;
      return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
    } });
    await useCase.execute();
    assert.deepEqual(received, { page: 1, limit: 10 });
  });

  it('rejects invalid pagination before calling the repository', async () => {
    const useCase = new GetMyActivityUseCase({ getMyActivity: async () => { throw new Error('called'); } });
    assert.throws(() => useCase.execute({ page: 0 }), /página/);
    assert.throws(() => useCase.execute({ limit: 51 }), /límite/);
  });
});
