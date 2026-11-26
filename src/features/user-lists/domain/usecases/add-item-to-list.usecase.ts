import type { UserListsRepository } from '../repositories/user-lists.repository';

export class AddItemToListUseCase {
  constructor(private readonly repository: UserListsRepository) {}
  execute(listId: string, mediaItemId: string) {
    return this.repository.addItem(listId, mediaItemId);
  }
}
