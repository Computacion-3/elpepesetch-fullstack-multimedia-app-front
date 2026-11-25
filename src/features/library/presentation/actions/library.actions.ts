'use server';

import { runAuthenticated } from '@/src/lib/run-authenticated';
import type { ActionResult } from '@/src/shared/domain/action-result';
import type { AddLibraryEntryParams, LibraryQuery } from '../../domain/repositories/library.repository';
import type { LibraryEntryChanges } from '../../domain/entities/library-entry';
import { createLibraryContainer } from '../../di/library.container';
import { LibraryEntryViewModelMapper, LibraryMediaOptionViewModelMapper } from '../viewmodels/library-entry.viewmodel';
import type { LibraryEntryViewModel, LibraryMediaOptionViewModel } from '../viewmodels/library-entry.viewmodel';

type LibraryPageViewModel = {
  data: LibraryEntryViewModel[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

/** Carga la biblioteca propia con la fuente de datos configurada en el servidor. */
export async function listLibraryAction(query: LibraryQuery): Promise<ActionResult<LibraryPageViewModel>> {
  return runAuthenticated('No se pudo cargar tu biblioteca', async (token) => {
    const result = await createLibraryContainer({ token }).getLibrary.execute(query);
    return { ...result, data: result.data.map(LibraryEntryViewModelMapper.toViewModel) };
  });
}

/** Carga una entrada propia y sus datos multimedia. */
export async function getLibraryEntryAction(id: string): Promise<ActionResult<LibraryEntryViewModel>> {
  return runAuthenticated('No se pudo cargar esta entrada', async (token) => {
    const entry = await createLibraryContainer({ token }).getLibraryEntry.execute(id);
    if (!entry) throw new Error('No se encontró esta entrada.');
    return LibraryEntryViewModelMapper.toViewModel(entry);
  });
}

/** Obtiene las opciones visibles del catálogo multimedia. */
export async function getLibraryMediaOptionsAction(): Promise<ActionResult<LibraryMediaOptionViewModel[]>> {
  return runAuthenticated('No se pudo cargar el catálogo', async (token) => {
    const options = await createLibraryContainer({ token }).getLibraryMediaOptions.execute();
    return options.map(LibraryMediaOptionViewModelMapper.toViewModel);
  });
}

/** Agrega un elemento visible a la biblioteca del usuario autenticado. */
export async function addLibraryEntryAction(params: AddLibraryEntryParams): Promise<ActionResult<LibraryEntryViewModel>> {
  return runAuthenticated('No se pudo agregar el elemento', async (token) => {
    const entry = await createLibraryContainer({ token }).addLibraryEntry.execute(params);
    return LibraryEntryViewModelMapper.toViewModel(entry);
  });
}

/** Actualiza únicamente los campos admitidos por el backend. */
export async function updateLibraryEntryAction(id: string, changes: LibraryEntryChanges): Promise<ActionResult<LibraryEntryViewModel>> {
  return runAuthenticated('No se pudo actualizar la entrada', async (token) => {
    const entry = await createLibraryContainer({ token }).updateLibraryEntry.execute(id, changes);
    return LibraryEntryViewModelMapper.toViewModel(entry);
  });
}

/** Elimina una entrada propia. El backend vuelve a validar su propiedad. */
export async function removeLibraryEntryAction(id: string): Promise<ActionResult<null>> {
  return runAuthenticated('No se pudo eliminar la entrada', async (token) => {
    await createLibraryContainer({ token }).removeLibraryEntry.execute(id);
    return null;
  });
}
