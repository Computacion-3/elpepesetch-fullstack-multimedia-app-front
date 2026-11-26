import {
  assertValidUserListDraft,
  type UserListDraft,
} from '../entities/user-list';
import type { UserListsRepository } from '../repositories/user-lists.repository';

export class CreateUserListUseCase {
  constructor(private readonly repository: UserListsRepository) {}
  execute(draft: UserListDraft) {
    assertValidUserListDraft(draft);
    return this.repository.create(draft);
  }
}
