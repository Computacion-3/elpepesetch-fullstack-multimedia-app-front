import { NotFoundError } from '../../../../shared/domain/errors';
import { toDomainError } from '../../../../shared/infrastructure/error-translator';
import type { Page } from '../../../../shared/domain/page';
import type {
  UserList,
  UserListChanges,
  UserListDraft,
} from '../../domain/entities/user-list';
import type {
  PublicListsQuery,
  UserListsRepository,
} from '../../domain/repositories/user-lists.repository';
import type { UserListsDatasource } from '../datasources/user-lists.datasource';
import { UserListMapper } from '../mappers/user-list.mapper';

export class UserListsRepositoryImpl implements UserListsRepository {
  constructor(private readonly datasource: UserListsDatasource) {}
  async getMyLists(): Promise<UserList[]> {
    return this.run(async () =>
      (await this.datasource.getMyLists()).map(UserListMapper.toDomain),
    );
  }
  async getPublicLists(query: PublicListsQuery): Promise<Page<UserList>> {
    return this.run(async () =>
      UserListMapper.toPage(await this.datasource.getPublicLists(query)),
    );
  }
  async getById(id: string): Promise<UserList> {
    return this.run(async () =>
      UserListMapper.toDomain(await this.datasource.getById(id)),
    );
  }
  async create(draft: UserListDraft): Promise<UserList> {
    return this.run(async () =>
      UserListMapper.toDomain(await this.datasource.create(draft)),
    );
  }
  async update(id: string, changes: UserListChanges): Promise<UserList> {
    return this.run(async () =>
      UserListMapper.toDomain(await this.datasource.update(id, changes)),
    );
  }
  async delete(id: string): Promise<void> {
    return this.run(async () => {
      if (!(await this.datasource.delete(id)))
        throw new NotFoundError('No se encontró la lista.');
    });
  }
  async addItem(listId: string, mediaItemId: string): Promise<UserList> {
    return this.run(async () =>
      UserListMapper.toDomain(
        await this.datasource.addItem(listId, mediaItemId),
      ),
    );
  }
  async removeItem(listId: string, mediaItemId: string): Promise<void> {
    return this.run(async () => {
      if (!(await this.datasource.removeItem(listId, mediaItemId)))
        throw new NotFoundError('No se encontró el elemento en la lista.');
    });
  }
  private async run<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      throw toDomainError(error);
    }
  }
}
