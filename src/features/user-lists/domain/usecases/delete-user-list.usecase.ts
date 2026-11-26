import type { UserListsRepository } from '../repositories/user-lists.repository';

export class DeleteUserListUseCase {
  constructor(private readonly repository: UserListsRepository) {}
  execute(id: string) {
    return this.repository.delete(id);
  }
}
