'use server';

import { runAuthorized } from '@/src/lib/run-authorized';
import { PERMISSIONS } from '@/src/shared/permissions';
import type { ActionResult } from '@/src/shared/domain/action-result';
import { usersContainer } from '../../di/users.container';
import type { UserChanges, UserDraft, UserFilters } from '../../domain/entities/user-account';
import {
    UsersViewModelMapper,
    type UsersPageViewModel,
    type UserViewModel,
} from '../viewmodels/users.viewmodel';

/** Lists users with filters and pagination. */
export async function listUsersAction(filters: UserFilters): Promise<ActionResult<UsersPageViewModel>> {
    return runAuthorized(PERMISSIONS.USERS_MANAGE, 'No se pudo cargar los usuarios', async (token) =>
        UsersViewModelMapper.toPage(await usersContainer.users.list.execute(token, filters)),
    );
}

/** Creates a user. */
export async function createUserAction(draft: UserDraft): Promise<ActionResult<UserViewModel>> {
    return runAuthorized(PERMISSIONS.USERS_MANAGE, 'No se pudo crear el usuario', async (token) =>
        UsersViewModelMapper.toViewModel(await usersContainer.users.create.execute(token, draft)),
    );
}

/** Updates a user. */
export async function updateUserAction(id: number, changes: UserChanges): Promise<ActionResult<UserViewModel>> {
    return runAuthorized(PERMISSIONS.USERS_MANAGE, 'No se pudo actualizar el usuario', async (token) =>
        UsersViewModelMapper.toViewModel(await usersContainer.users.update.execute(token, id, changes)),
    );
}

/** Assigns a role to a user. */
export async function assignUserRoleAction(id: number, roleId: number): Promise<ActionResult<UserViewModel>> {
    return runAuthorized(PERMISSIONS.USERS_MANAGE, 'No se pudo asignar el rol', async (token) =>
        UsersViewModelMapper.toViewModel(await usersContainer.users.assignRole.execute(token, id, roleId)),
    );
}

/** Activates or deactivates a user. */
export async function setUserStatusAction(id: number, isActive: boolean): Promise<ActionResult<UserViewModel>> {
    return runAuthorized(PERMISSIONS.USERS_MANAGE, 'No se pudo cambiar el estado del usuario', async (token) =>
        UsersViewModelMapper.toViewModel(await usersContainer.users.setStatus.execute(token, id, isActive)),
    );
}

/** Deletes a user. */
export async function deleteUserAction(id: number): Promise<ActionResult<null>> {
    return runAuthorized(PERMISSIONS.USERS_MANAGE, 'No se pudo eliminar el usuario', async (token) => {
        await usersContainer.users.remove.execute(token, id);
        return null;
    });
}
