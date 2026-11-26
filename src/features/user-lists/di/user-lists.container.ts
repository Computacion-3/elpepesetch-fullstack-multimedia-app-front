import { UnexpectedError } from '@/src/shared/domain/errors';
import type { GraphQLClient } from '@/src/shared/infrastructure/graphql-client';
import type { HttpClient } from '@/src/shared/infrastructure/http-client';
import { runAuthenticated } from '@/src/lib/run-authenticated';
import type { ActionResult } from '@/src/shared/domain/action-result';
import { createFetchHttpClient } from '@/src/shared/infrastructure/http-client';
import { createGraphQLClient } from '@/src/shared/infrastructure/graphql-client';
import { AddItemToListUseCase } from '../domain/usecases/add-item-to-list.usecase';
import { CreateUserListUseCase } from '../domain/usecases/create-user-list.usecase';
import { DeleteUserListUseCase } from '../domain/usecases/delete-user-list.usecase';
import { GetMyListsUseCase } from '../domain/usecases/get-my-lists.usecase';
import { GetPublicListsUseCase } from '../domain/usecases/get-public-lists.usecase';
import { GetUserListUseCase } from '../domain/usecases/get-user-list.usecase';
import { RemoveItemFromListUseCase } from '../domain/usecases/remove-item-from-list.usecase';
import { UpdateUserListUseCase } from '../domain/usecases/update-user-list.usecase';
import { UserListsGraphQLDatasource } from '../infrastructure/datasources/user-lists-graphql.datasource';
import type { UserListsDatasource } from '../infrastructure/datasources/user-lists.datasource';
import { UserListsHttpDatasource } from '../infrastructure/datasources/user-lists-http.datasource';
import { UserListsRepositoryImpl } from '../infrastructure/repositories/user-lists.repository.impl';

interface UserListsContainerOptions {
  token: string;
  httpClient: HttpClient;
  graphqlClient: GraphQLClient;
  dataSource?: string;
}

export function createUserListsContainer(options: UserListsContainerOptions) {
  const mode =
    options.dataSource ?? process.env.NEXT_PUBLIC_DATA_SOURCE ?? 'rest';
  let datasource: UserListsDatasource;
  if (mode === 'rest')
    datasource = new UserListsHttpDatasource(options.httpClient, options.token);
  else if (mode === 'graphql')
    datasource = new UserListsGraphQLDatasource(
      options.graphqlClient,
      options.token,
    );
  else throw new UnexpectedError(`Fuente de datos no compatible: ${mode}`);

  const repository = new UserListsRepositoryImpl(datasource);
  return {
    getMyLists: new GetMyListsUseCase(repository),
    getPublicLists: new GetPublicListsUseCase(repository),
    getUserList: new GetUserListUseCase(repository),
    createUserList: new CreateUserListUseCase(repository),
    updateUserList: new UpdateUserListUseCase(repository),
    deleteUserList: new DeleteUserListUseCase(repository),
    addItemToList: new AddItemToListUseCase(repository),
    removeItemFromList: new RemoveItemFromListUseCase(repository),
  };
}

export async function withUserLists<T>(
  fallback: string,
  run: (lists: ReturnType<typeof createUserListsContainer>) => Promise<T>,
): Promise<ActionResult<T>> {
  return runAuthenticated(fallback, async (token) => {
    const httpClient = createFetchHttpClient();
    const lists = createUserListsContainer({
      token,
      httpClient,
      graphqlClient: createGraphQLClient(httpClient),
    });
    return run(lists);
  });
}
