import type {
  PublicListsQuery,
  UserListsRepository,
} from '../repositories/user-lists.repository';

export class GetPublicListsUseCase {
  constructor(private readonly repository: UserListsRepository) {}
  execute(query: PublicListsQuery) {
    return this.repository.getPublicLists(query);
  }
}
