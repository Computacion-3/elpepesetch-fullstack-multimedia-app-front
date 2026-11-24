'use server';

import { runAuthorized } from '@/src/lib/run-authorized';
import { PERMISSIONS } from '@/src/shared/permissions';
import type { ActionResult } from '@/src/shared/domain/action-result';
import { usersContainer } from '../../di/users.container';
import type { RoleDraft } from '../../domain/entities/role';
import { RolesViewModelMapper, type RoleViewModel } from '../viewmodels/roles.viewmodel';

/** Lists roles. */
export async function listRolesAction(): Promise<ActionResult<RoleViewModel[]>> {
    return runAuthorized(PERMISSIONS.ROLES_MANAGE, 'No se pudo cargar los roles', async (token) =>
        (await usersContainer.roles.list.execute(token)).map(RolesViewModelMapper.toViewModel),
    );
}

/** Gets a role with its permissions. */
export async function getRoleAction(id: number): Promise<ActionResult<RoleViewModel>> {
    return runAuthorized(PERMISSIONS.ROLES_MANAGE, 'No se pudo cargar el rol', async (token) =>
        RolesViewModelMapper.toViewModel(await usersContainer.roles.get.execute(token, id)),
    );
}

/** Creates a role. */
export async function createRoleAction(draft: RoleDraft): Promise<ActionResult<RoleViewModel>> {
    return runAuthorized(PERMISSIONS.ROLES_MANAGE, 'No se pudo crear el rol', async (token) =>
        RolesViewModelMapper.toViewModel(await usersContainer.roles.create.execute(token, draft)),
    );
}

/** Updates a role. */
export async function updateRoleAction(id: number, draft: RoleDraft): Promise<ActionResult<RoleViewModel>> {
    return runAuthorized(PERMISSIONS.ROLES_MANAGE, 'No se pudo actualizar el rol', async (token) =>
        RolesViewModelMapper.toViewModel(await usersContainer.roles.update.execute(token, id, draft)),
    );
}

/** Replaces the permissions of a role. */
export async function setRolePermissionsAction(
    id: number,
    permissionIds: number[],
): Promise<ActionResult<RoleViewModel>> {
    return runAuthorized(PERMISSIONS.ROLES_MANAGE, 'No se pudo guardar los permisos del rol', async (token) =>
        RolesViewModelMapper.toViewModel(await usersContainer.roles.setPermissions.execute(token, id, permissionIds)),
    );
}

/** Deletes a role. */
export async function deleteRoleAction(id: number): Promise<ActionResult<null>> {
    return runAuthorized(PERMISSIONS.ROLES_MANAGE, 'No se pudo eliminar el rol', async (token) => {
        await usersContainer.roles.remove.execute(token, id);
        return null;
    });
}
