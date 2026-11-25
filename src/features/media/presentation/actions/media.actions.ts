'use server';

import { runAuthenticated } from '@/src/lib/run-authenticated';
import { runAuthorized } from '@/src/lib/run-authorized';
import { PERMISSIONS } from '@/src/shared/permissions';
import type { ActionResult } from '@/src/shared/domain/action-result';
import type { MediaApprovalDraft, MediaItemChanges, MediaItemDraft, MediaQuery } from '../../domain/entities/media-item';
import { mediaContainer } from '../../di/media.container';
import type { MediaPageViewModel, MediaItemViewModel } from '../viewmodels/media.viewmodel';
import { MediaViewModelMapper } from '../viewmodels/media.viewmodel';

/** Consulta el catálogo; el backend incluye solo elementos visibles para el usuario. */
export async function listMediaAction(query: MediaQuery): Promise<ActionResult<MediaPageViewModel>> {
    return runAuthenticated('No se pudo cargar el catálogo', async (token) =>
        MediaViewModelMapper.toPage(await mediaContainer.list.execute(token, query)),
    );
}

/** Consulta propuestas pendientes; el backend vuelve a comprobar el permiso moderador. */
export async function listPendingMediaAction(query: MediaQuery): Promise<ActionResult<MediaPageViewModel>> {
    return runAuthorized(PERMISSIONS.CATALOG_MODERATE, 'No se pudieron cargar las propuestas', async (token) =>
        MediaViewModelMapper.toPage(await mediaContainer.listPending.execute(token, query)),
    );
}

/** Obtiene un detalle y respeta la visibilidad definida por el backend. */
export async function getMediaItemAction(id: string): Promise<ActionResult<MediaItemViewModel>> {
    return runAuthenticated('No se pudo cargar el detalle', async (token) =>
        MediaViewModelMapper.toViewModel(await mediaContainer.getById.execute(token, id)),
    );
}

/** Crea una propuesta y revalida `catalog:create` en cada ejecución. */
export async function createMediaItemAction(draft: MediaItemDraft): Promise<ActionResult<MediaItemViewModel>> {
    return runAuthorized(PERMISSIONS.CATALOG_CREATE, 'No se pudo enviar la propuesta', async (token) =>
        MediaViewModelMapper.toViewModel(await mediaContainer.create.execute(token, draft)),
    );
}

/** Actualiza una propuesta pendiente o un elemento permitido por el backend. */
export async function updateMediaItemAction(
    id: string,
    changes: MediaItemChanges,
): Promise<ActionResult<MediaItemViewModel>> {
    return runAuthorized(PERMISSIONS.CATALOG_UPDATE, 'No se pudo actualizar la propuesta', async (token) =>
        MediaViewModelMapper.toViewModel(await mediaContainer.update.execute(token, id, changes)),
    );
}

/** Envía la decisión de moderación; el caso de uso valida el motivo de rechazo. */
export async function setMediaItemApprovalAction(
    id: string,
    draft: MediaApprovalDraft,
): Promise<ActionResult<MediaItemViewModel>> {
    return runAuthorized(PERMISSIONS.CATALOG_MODERATE, 'No se pudo guardar la decisión', async (token) =>
        MediaViewModelMapper.toViewModel(await mediaContainer.setApproval.execute(token, id, draft)),
    );
}
