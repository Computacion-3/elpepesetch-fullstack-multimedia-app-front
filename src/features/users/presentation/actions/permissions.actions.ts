'use server';

import { runAuthorized } from '@/src/lib/run-authorized';
import { PERMISSIONS } from '@/src/shared/permissions';
import type { ActionResult } from '@/src/shared/domain/action-result';
import { usersContainer } from '../../di/users.container';
import type { PermissionDraft } from '../../domain/entities/permission';
import { PermissionsViewModelMapper, type PermissionViewModel } from '../viewmodels/permissions.viewmodel';

/** Lists permissions. */
export async function listPermissionsAction(): Promise<ActionResult<PermissionViewModel[]>> {
    return runAuthorized(PERMISSIONS.PERMISSIONS_MANAGE, 'No se pudo cargar los permisos', async (token) =>
        (await usersContainer.permissions.list.execute(token)).map(PermissionsViewModelMapper.toViewModel),
    );
}

/** Creates a permission. */
export async function createPermissionAction(draft: PermissionDraft): Promise<ActionResult<PermissionViewModel>> {
    return runAuthorized(PERMISSIONS.PERMISSIONS_MANAGE, 'No se pudo crear el permiso', async (token) =>
        PermissionsViewModelMapper.toViewModel(await usersContainer.permissions.create.execute(token, draft)),
    );
}

/** Updates a permission. */
export async function updatePermissionAction(
    id: number,
    draft: PermissionDraft,
): Promise<ActionResult<PermissionViewModel>> {
    return runAuthorized(PERMISSIONS.PERMISSIONS_MANAGE, 'No se pudo actualizar el permiso', async (token) =>
        PermissionsViewModelMapper.toViewModel(await usersContainer.permissions.update.execute(token, id, draft)),
    );
}

/** Deletes a permission. */
export async function deletePermissionAction(id: number): Promise<ActionResult<null>> {
    return runAuthorized(PERMISSIONS.PERMISSIONS_MANAGE, 'No se pudo eliminar el permiso', async (token) => {
        await usersContainer.permissions.remove.execute(token, id);
        return null;
    });
}
