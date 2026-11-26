import type { HttpClient } from '@/src/shared/infrastructure/http-client';
import type {
  CreateUserListDto,
  PaginatedUserListsDto,
  PublicListsQueryDto,
  UpdateUserListDto,
  UserListDto,
} from '../dtos/user-list.dto';
import type { UserListsDatasource } from './user-lists.datasource';

export class UserListsHttpDatasource implements UserListsDatasource {
  constructor(
    private readonly http: HttpClient,
    private readonly token: string,
  ) {}

  getMyLists() {
    return this.http.get<UserListDto[]>('/lists', this.token);
  }
  getPublicLists(query: PublicListsQueryDto) {
    const params = new URLSearchParams({
      page: String(query.page),
      limit: String(query.limit),
    });
    return this.http.get<PaginatedUserListsDto>(
      `/lists/public?${params}`,
      this.token,
    );
  }
  getById(id: string) {
    return this.http.get<UserListDto>(
      `/lists/${encodeURIComponent(id)}`,
      this.token,
    );
  }
  create(input: CreateUserListDto) {
    return this.http.post<UserListDto>('/lists', input, this.token);
  }
  update(id: string, input: UpdateUserListDto) {
    return this.http.patch<UserListDto>(
      `/lists/${encodeURIComponent(id)}`,
      input,
      this.token,
    );
  }
  async delete(id: string) {
    await this.http.delete<void>(
      `/lists/${encodeURIComponent(id)}`,
      this.token,
    );
    return true;
  }
  addItem(listId: string, mediaItemId: string) {
    return this.http.post<UserListDto>(
      `/lists/${encodeURIComponent(listId)}/items`,
      { mediaItemId },
      this.token,
    );
  }
  async removeItem(listId: string, mediaItemId: string) {
    await this.http.delete<void>(
      `/lists/${encodeURIComponent(listId)}/items/${encodeURIComponent(mediaItemId)}`,
      this.token,
    );
    return true;
  }
}
