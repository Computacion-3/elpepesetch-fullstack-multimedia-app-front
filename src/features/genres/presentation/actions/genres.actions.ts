'use server';

import { runAuthenticated } from '@/src/lib/run-authenticated';
import { runAuthorized } from '@/src/lib/run-authorized';
import { PERMISSIONS } from '@/src/shared/permissions';
import type { ActionResult } from '@/src/shared/domain/action-result';
import type { GenreChanges, GenreDraft } from '../../domain/entities/genre';
import { genresContainer } from '../../di/genres.container';
import type { GenreViewModel } from '../viewmodels/genre.viewmodel';
import { GenreViewModelMapper } from '../viewmodels/genre.viewmodel';

/** Lista géneros para filtros y formularios de propuestas. */
export async function listGenresAction(): Promise<ActionResult<GenreViewModel[]>> {
    return runAuthenticated('No se pudieron cargar los géneros', async (token) =>
        (await genresContainer.list.execute(token)).map(GenreViewModelMapper.toViewModel),
    );
}

/** Crea un género con autorización comprobada en el servidor. */
export async function createGenreAction(draft: GenreDraft): Promise<ActionResult<GenreViewModel>> {
    return runAuthorized(PERMISSIONS.GENRES_MANAGE, 'No se pudo crear el género', async (token) =>
        GenreViewModelMapper.toViewModel(await genresContainer.create.execute(token, draft)),
    );
}

/** Actualiza un género con autorización comprobada en el servidor. */
export async function updateGenreAction(
    id: string,
    changes: GenreChanges,
): Promise<ActionResult<GenreViewModel>> {
    return runAuthorized(PERMISSIONS.GENRES_MANAGE, 'No se pudo actualizar el género', async (token) =>
        GenreViewModelMapper.toViewModel(await genresContainer.update.execute(token, id, changes)),
    );
}

/** Elimina el género; el backend devuelve conflicto si se encuentra en uso. */
export async function deleteGenreAction(id: string): Promise<ActionResult<null>> {
    return runAuthorized(PERMISSIONS.GENRES_MANAGE, 'No se pudo eliminar el género', async (token) => {
        await genresContainer.delete.execute(token, id);
        return null;
    });
}
