import type { Page } from '@/src/shared/domain/page';
import type {
  UserList,
  UserListChanges,
  UserListDraft,
} from '../entities/user-list';

export interface PublicListsQuery {
  page: number;
  limit: number;
}

export interface UserListsRepository {
  getMyLists(): Promise<UserList[]>;
  getPublicLists(query: PublicListsQuery): Promise<Page<UserList>>;
  getById(id: string): Promise<UserList>;
  create(draft: UserListDraft): Promise<UserList>;
  update(id: string, changes: UserListChanges): Promise<UserList>;
  delete(id: string): Promise<void>;
  addItem(listId: string, mediaItemId: string): Promise<UserList>;
  removeItem(listId: string, mediaItemId: string): Promise<void>;
}
