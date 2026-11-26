import type {
  CreateUserListDto,
  PaginatedUserListsDto,
  PublicListsQueryDto,
  UpdateUserListDto,
  UserListDto,
} from '../dtos/user-list.dto';

export interface UserListsDatasource {
  getMyLists(): Promise<UserListDto[]>;
  getPublicLists(query: PublicListsQueryDto): Promise<PaginatedUserListsDto>;
  getById(id: string): Promise<UserListDto>;
  create(input: CreateUserListDto): Promise<UserListDto>;
  update(id: string, input: UpdateUserListDto): Promise<UserListDto>;
  delete(id: string): Promise<boolean>;
  addItem(listId: string, mediaItemId: string): Promise<UserListDto>;
  removeItem(listId: string, mediaItemId: string): Promise<boolean>;
}
