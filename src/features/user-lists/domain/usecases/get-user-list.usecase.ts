import type { UserListsRepository } from '../repositories/user-lists.repository';

export class GetUserListUseCase {
  constructor(private readonly repository: UserListsRepository) {}
  execute(id: string) {
    return this.repository.getById(id);
  }
}
