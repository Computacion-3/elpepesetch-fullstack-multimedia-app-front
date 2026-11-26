import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ConflictError } from '../../../../shared/domain/errors';
import { HttpError } from '../../../../shared/infrastructure/http-client';
import type { UserListsDatasource } from '../datasources/user-lists.datasource';
import { UserListsRepositoryImpl } from './user-lists.repository.impl';

const dto = {
  id: 'list-id',
  name: 'Colección',
  description: null,
  visibility: 'PRIVATE' as const,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  owner: { id: 1, username: 'ana' },
  items: [],
};

function fakeDatasource(
  overrides: Partial<UserListsDatasource> = {},
): UserListsDatasource {
  return {
    getMyLists: async () => [],
    getPublicLists: async () => ({
      data: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
    }),
    getById: async () => dto,
    create: async () => dto,
    update: async () => dto,
    delete: async () => true,
    addItem: async () => dto,
    removeItem: async () => true,
    ...overrides,
  };
}

describe('UserListsRepositoryImpl', () => {
  it('maps own lists to domain entities', async () => {
    const datasource = fakeDatasource({ getMyLists: async () => [dto] });
    const lists = await new UserListsRepositoryImpl(datasource).getMyLists();
    assert.equal(lists[0].owner.username, 'ana');
  });

  it('translates backend conflicts to domain errors', async () => {
    const datasource = fakeDatasource({
      create: async () => {
        throw new HttpError(409, 'Nombre duplicado');
      },
    });
    await assert.rejects(
      new UserListsRepositoryImpl(datasource).create({ name: 'Colección' }),
      ConflictError,
    );
  });
});
