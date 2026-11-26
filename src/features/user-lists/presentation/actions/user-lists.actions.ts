'use server';

import type { ActionResult } from '@/src/shared/domain/action-result';
import { withUserLists } from '../../di/user-lists.container';
import type {
  UserListChanges,
  UserListDraft,
} from '../../domain/entities/user-list';
import type { PublicListsQuery } from '../../domain/repositories/user-lists.repository';
import type { UserListViewModel } from '../viewmodels/user-list.viewmodel';
import { UserListViewModelMapper } from '../viewmodels/user-list.viewmodel';

export async function listMyListsAction(): Promise<
  ActionResult<UserListViewModel[]>
> {
  return withUserLists(
    'No se pudieron cargar tus listas.',
    async ({ getMyLists }) =>
      (await getMyLists.execute()).map(UserListViewModelMapper.toViewModel),
  );
}
export async function listPublicListsAction(
  query: PublicListsQuery,
): Promise<ActionResult<ReturnType<typeof UserListViewModelMapper.toPage>>> {
  return withUserLists(
    'No se pudieron cargar las listas públicas.',
    async ({ getPublicLists }) =>
      UserListViewModelMapper.toPage(await getPublicLists.execute(query)),
  );
}
export async function getUserListAction(
  id: string,
): Promise<ActionResult<UserListViewModel>> {
  return withUserLists('No se pudo cargar la lista.', async ({ getUserList }) =>
    UserListViewModelMapper.toViewModel(await getUserList.execute(id)),
  );
}
export async function createUserListAction(
  draft: UserListDraft,
): Promise<ActionResult<UserListViewModel>> {
  return withUserLists(
    'No se pudo crear la lista.',
    async ({ createUserList }) =>
      UserListViewModelMapper.toViewModel(await createUserList.execute(draft)),
  );
}
export async function updateUserListAction(
  id: string,
  changes: UserListChanges,
): Promise<ActionResult<UserListViewModel>> {
  return withUserLists(
    'No se pudo actualizar la lista.',
    async ({ updateUserList }) =>
      UserListViewModelMapper.toViewModel(
        await updateUserList.execute(id, changes),
      ),
  );
}
export async function deleteUserListAction(
  id: string,
): Promise<ActionResult<string>> {
  return withUserLists(
    'No se pudo eliminar la lista.',
    async ({ deleteUserList }) => {
      await deleteUserList.execute(id);
      return id;
    },
  );
}
export async function addItemToListAction(
  listId: string,
  mediaItemId: string,
): Promise<ActionResult<UserListViewModel>> {
  return withUserLists(
    'No se pudo agregar el medio.',
    async ({ addItemToList }) =>
      UserListViewModelMapper.toViewModel(
        await addItemToList.execute(listId, mediaItemId),
      ),
  );
}
export async function removeItemFromListAction(
  listId: string,
  mediaItemId: string,
): Promise<ActionResult<string>> {
  return withUserLists(
    'No se pudo quitar el medio.',
    async ({ removeItemFromList }) => {
      await removeItemFromList.execute(listId, mediaItemId);
      return mediaItemId;
    },
  );
}
