import {
  assertValidUserListChanges,
  type UserListChanges,
} from '../entities/user-list';
import type { UserListsRepository } from '../repositories/user-lists.repository';

export class UpdateUserListUseCase {
  constructor(private readonly repository: UserListsRepository) {}
  execute(id: string, changes: UserListChanges) {
    assertValidUserListChanges(changes);
    return this.repository.update(id, changes);
  }
}
