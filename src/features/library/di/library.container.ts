import { AddLibraryEntryUseCase } from '../domain/usecases/add-library-entry.usecase';
import { GetLibraryEntryUseCase } from '../domain/usecases/get-library-entry.usecase';
import { GetLibraryMediaOptionsUseCase } from '../domain/usecases/get-library-media-options.usecase';
import { GetLibraryUseCase } from '../domain/usecases/get-library.usecase';
import { RemoveLibraryEntryUseCase } from '../domain/usecases/remove-library-entry.usecase';
import { UpdateLibraryEntryUseCase } from '../domain/usecases/update-library-entry.usecase';
import { LibraryMockDatasource } from '../infrastructure/datasources/library-mock.datasource';
import type {
  LibraryCatalogDatasource,
  LibraryDatasource,
} from '../infrastructure/datasources/library.datasource';
import {
  LibraryCatalogRepositoryImpl,
  LibraryRepositoryImpl,
} from '../infrastructure/repositories/library.repository.impl';

export interface LibraryContainerOptions {
  libraryDatasource?: LibraryDatasource;
  catalogDatasource?: LibraryCatalogDatasource;
}

/**
 * TODO: inject LibraryHttpDatasource with the shared authenticated client once
 * Auth/HTTP integration is available; Media must replace the temporary catalog.
 */
export function createLibraryContainer(options: LibraryContainerOptions = {}) {
  const demoDatasource = new LibraryMockDatasource();
  const datasource = options.libraryDatasource ?? demoDatasource;
  const catalogDatasource =
    options.catalogDatasource ??
    (datasource === demoDatasource
      ? demoDatasource
      : new LibraryMockDatasource());
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
