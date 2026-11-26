import type { UserListsRepository } from '../repositories/user-lists.repository';

export class RemoveItemFromListUseCase {
  constructor(private readonly repository: UserListsRepository) {}
  execute(listId: string, mediaItemId: string) {
    return this.repository.removeItem(listId, mediaItemId);
  }
}
