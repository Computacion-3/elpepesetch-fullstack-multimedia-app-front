import type { UserListsRepository } from '../repositories/user-lists.repository';

export class GetMyListsUseCase {
  constructor(private readonly repository: UserListsRepository) {}
  execute() {
    return this.repository.getMyLists();
  }
}
