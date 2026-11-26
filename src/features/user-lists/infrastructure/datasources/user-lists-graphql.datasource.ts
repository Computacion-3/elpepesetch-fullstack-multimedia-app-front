import type { GraphQLClient } from '@/src/shared/infrastructure/graphql-client';
import type {
  CreateUserListDto,
  PaginatedUserListsDto,
  PublicListsQueryDto,
  UpdateUserListDto,
  UserListDto,
} from '../dtos/user-list.dto';
import type { UserListsDatasource } from './user-lists.datasource';

const FIELDS = `id name description visibility createdAt updatedAt owner { id username } items { id title type coverUrl releaseYear creator pages durationMinutes platform averageRating ratingsCount genres { id name } }`;
const MY_LISTS = `query MyLists { myLists { ${FIELDS} } }`;
const PUBLIC_LISTS = `query PublicLists($filter: PublicListFilterInput) { publicLists(filter: $filter) { data { ${FIELDS} } meta { total page limit totalPages } } }`;
const GET_LIST = `query UserList($id: ID!) { userList(id: $id) { ${FIELDS} } }`;
const CREATE = `mutation CreateUserList($input: CreateUserListInput!) { createUserList(input: $input) { ${FIELDS} } }`;
const UPDATE = `mutation UpdateUserList($id: ID!, $input: UpdateUserListInput!) { updateUserList(id: $id, input: $input) { ${FIELDS} } }`;
const DELETE = 'mutation DeleteUserList($id: ID!) { deleteUserList(id: $id) }';
const ADD = `mutation AddItemToList($listId: ID!, $input: AddListItemInput!) { addItemToList(listId: $listId, input: $input) { ${FIELDS} } }`;
const REMOVE =
  'mutation RemoveItemFromList($listId: ID!, $mediaItemId: ID!) { removeItemFromList(listId: $listId, mediaItemId: $mediaItemId) }';

export class UserListsGraphQLDatasource implements UserListsDatasource {
  constructor(
    private readonly graph: GraphQLClient,
    private readonly token: string,
  ) {}

  async getMyLists() {
    return (
      await this.graph.execute<{ myLists: UserListDto[] }>(
        MY_LISTS,
        undefined,
        this.token,
      )
    ).myLists;
  }
  async getPublicLists(query: PublicListsQueryDto) {
    return (
      await this.graph.execute<{ publicLists: PaginatedUserListsDto }>(
        PUBLIC_LISTS,
        { filter: query },
        this.token,
      )
    ).publicLists;
  }
  async getById(id: string) {
    return (
      await this.graph.execute<{ userList: UserListDto }>(
        GET_LIST,
        { id },
        this.token,
      )
    ).userList;
  }
  async create(input: CreateUserListDto) {
    return (
      await this.graph.execute<{ createUserList: UserListDto }>(
        CREATE,
        { input },
        this.token,
      )
    ).createUserList;
  }
  async update(id: string, input: UpdateUserListDto) {
    return (
      await this.graph.execute<{ updateUserList: UserListDto }>(
        UPDATE,
        { id, input },
        this.token,
      )
    ).updateUserList;
  }
  async delete(id: string) {
    return (
      await this.graph.execute<{ deleteUserList: boolean }>(
        DELETE,
        { id },
        this.token,
      )
    ).deleteUserList;
  }
  async addItem(listId: string, mediaItemId: string) {
    return (
      await this.graph.execute<{ addItemToList: UserListDto }>(
        ADD,
        { listId, input: { mediaItemId } },
        this.token,
      )
    ).addItemToList;
  }
  async removeItem(listId: string, mediaItemId: string) {
    return (
      await this.graph.execute<{ removeItemFromList: boolean }>(
        REMOVE,
        { listId, mediaItemId },
        this.token,
      )
    ).removeItemFromList;
  }
}
