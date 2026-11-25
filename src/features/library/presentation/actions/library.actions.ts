'use server';

import { runAuthenticated } from '@/src/lib/run-authenticated';
import type { ActionResult } from '@/src/shared/domain/action-result';
import { createFetchHttpClient } from '@/src/shared/infrastructure/http-client';
import { createGraphQLClient, type GraphQLClient } from '@/src/shared/infrastructure/graphql-client';
import { createLibraryContainer } from '../../di/library.container';
import type { AddLibraryEntryParams, LibraryQuery } from '../../domain/repositories/library.repository';
import type { LibraryEntryViewModel } from '../viewmodels/library-entry.viewmodel';
import { LibraryEntryViewModelMapper } from '../viewmodels/library-entry.viewmodel';
import type { LibraryEntryChanges } from '../../domain/entities/library-entry';

async function withLibrary<T>(fallback: string, run: (library: ReturnType<typeof createLibraryContainer>) => Promise<T>): Promise<ActionResult<T>> {
  return runAuthenticated(fallback, async (token) => {
    const http = createFetchHttpClient();
    const graph = createGraphQLClient(http);
    const authenticatedGraph: GraphQLClient = {
      execute: (document, variables) => graph.execute(document, variables, token),
    };
    const library = createLibraryContainer({
      graphqlClient: authenticatedGraph,
      httpClient: {
        request: async <T>(path: string, options: { method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'; query?: URLSearchParams; body?: unknown } = {}): Promise<T> => {
          const suffix = options.query?.size ? `?${options.query}` : '';
          const url = `${path}${suffix}`;
          switch (options.method ?? 'GET') {
            case 'POST': return http.post<T>(url, options.body, token);
            case 'PATCH': return http.patch<T>(url, options.body, token);
            case 'DELETE': return http.delete<T>(url, token);
            default: return http.get<T>(url, token);
          }
        },
      },
    });
    return run(library);
  });
}

export async function listLibraryAction(query: LibraryQuery): Promise<ActionResult<{ data: LibraryEntryViewModel[]; meta: { total: number; page: number; limit: number; totalPages: number } }>> {
  return withLibrary('No se pudo cargar la biblioteca', async ({ getLibrary }) => {
    const result = await getLibrary.execute(query);
    return { ...result, data: result.data.map(LibraryEntryViewModelMapper.toViewModel) };
  });
}

export async function getLibraryEntryAction(id: string): Promise<ActionResult<LibraryEntryViewModel>> {
  return withLibrary('No se pudo cargar la entrada', async ({ getLibraryEntry }) =>
    LibraryEntryViewModelMapper.toViewModel(await getLibraryEntry.execute(id)));
}

export async function getLibraryMediaItemIdsAction(): Promise<ActionResult<string[]>> {
  return withLibrary('No se pudo consultar la biblioteca actual', async ({ getLibrary }) => {
    const pageSize = 50;
    const firstPage = await getLibrary.execute({ page: 1, limit: pageSize });
    const mediaItemIds = firstPage.data.map((entry) => entry.mediaItemId);
    for (let page = 2; page <= firstPage.meta.totalPages; page += 1) {
      const nextPage = await getLibrary.execute({ page, limit: pageSize });
      mediaItemIds.push(...nextPage.data.map((entry) => entry.mediaItemId));
    }
    return mediaItemIds;
  });
}

export async function addLibraryEntryAction(params: AddLibraryEntryParams): Promise<ActionResult<LibraryEntryViewModel>> {
  return withLibrary('No se pudo agregar el elemento', async ({ addLibraryEntry }) =>
    LibraryEntryViewModelMapper.toViewModel(await addLibraryEntry.execute(params)));
}

export async function updateLibraryEntryAction(id: string, changes: LibraryEntryChanges): Promise<ActionResult<LibraryEntryViewModel>> {
  return withLibrary('No se pudo actualizar la entrada', async ({ updateLibraryEntry }) =>
    LibraryEntryViewModelMapper.toViewModel(await updateLibraryEntry.execute(id, changes)));
}

export async function removeLibraryEntryAction(id: string): Promise<ActionResult<string>> {
  return withLibrary('No se pudo eliminar la entrada', async ({ removeLibraryEntry }) => {
    await removeLibraryEntry.execute(id);
    return id;
  });
}
