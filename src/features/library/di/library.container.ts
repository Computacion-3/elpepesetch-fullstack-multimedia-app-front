import 'server-only';
import { createFetchHttpClient } from '@/src/shared/infrastructure/http-client';
import { createGraphQLClient } from '@/src/shared/infrastructure/graphql-client';
import { MediaRestDatasource } from '@/src/features/media/infrastructure/datasources/media-rest.datasource';
import type { MediaDatasource } from '@/src/features/media/infrastructure/datasources/media.datasource';
import { AddLibraryEntryUseCase } from '../domain/usecases/add-library-entry.usecase';
import { GetLibraryEntryUseCase } from '../domain/usecases/get-library-entry.usecase';
import { GetLibraryMediaOptionsUseCase } from '../domain/usecases/get-library-media-options.usecase';
import { GetLibraryUseCase } from '../domain/usecases/get-library.usecase';
import { RemoveLibraryEntryUseCase } from '../domain/usecases/remove-library-entry.usecase';
import { UpdateLibraryEntryUseCase } from '../domain/usecases/update-library-entry.usecase';
import type {
  LibraryCatalogDatasource,
  LibraryDatasource,
} from '../infrastructure/datasources/library.datasource';
import {
  LibraryCatalogRepositoryImpl,
  LibraryRepositoryImpl,
} from '../infrastructure/repositories/library.repository.impl';
import { LibraryHttpDatasource, SharedLibraryApiClient } from '../infrastructure/datasources/library-http.datasource';
import { LibraryGraphQLDatasource } from '../infrastructure/datasources/library-graphql.datasource';
import { LibraryMediaCatalogDatasource } from '../infrastructure/datasources/library-media-catalog.datasource';
import type { GraphQLClient } from '@/src/shared/infrastructure/graphql-client';
import type { HttpClient } from '@/src/shared/infrastructure/http-client';
import { UnexpectedError } from '@/src/shared/domain/errors';
import { getLibraryDataSourceMode } from '../infrastructure/datasources/library-data-source.factory';

export interface LibraryContainerOptions {
  token: string;
  libraryDatasource?: LibraryDatasource;
  catalogDatasource?: LibraryCatalogDatasource;
  http?: HttpClient;
  graphql?: GraphQLClient;
}

export function createLibraryContainer(options: LibraryContainerOptions) {
  const token = options.token;
  if (!token) throw new Error('Se requiere una sesión para abrir la biblioteca.');

  const http = options.http ?? createFetchHttpClient();
  const graphql = options.graphql ?? createGraphQLClient(http);
  let configuredSource: 'rest' | 'graphql';
  try {
    configuredSource = getLibraryDataSourceMode(process.env.NEXT_PUBLIC_DATA_SOURCE);
  } catch (error) {
    throw new UnexpectedError(error instanceof Error ? error.message : 'Fuente de datos inválida.');
  }

  // El catálogo Media mantiene REST; la selección aplica al CRUD de Biblioteca.
  const mediaDatasource: MediaDatasource = new MediaRestDatasource(http);
  const datasource = options.libraryDatasource ?? (configuredSource === 'graphql'
    ? new LibraryGraphQLDatasource(graphql, token)
    : new LibraryHttpDatasource(new SharedLibraryApiClient(http, token)));
  const catalogDatasource = options.catalogDatasource ??
    new LibraryMediaCatalogDatasource(mediaDatasource, token);
  const repository = new LibraryRepositoryImpl(datasource);
  const catalogRepository = new LibraryCatalogRepositoryImpl(catalogDatasource);

  return {
    getLibrary: new GetLibraryUseCase(repository),
    getLibraryEntry: new GetLibraryEntryUseCase(repository),
    addLibraryEntry: new AddLibraryEntryUseCase(repository),
    updateLibraryEntry: new UpdateLibraryEntryUseCase(repository),
    removeLibraryEntry: new RemoveLibraryEntryUseCase(repository),
    getLibraryMediaOptions: new GetLibraryMediaOptionsUseCase(
      catalogRepository,
    ),
  };
}

export type LibraryContainer = ReturnType<typeof createLibraryContainer>;
