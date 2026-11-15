import { AddLibraryEntryUseCase } from '../domain/usecases/add-library-entry.usecase';
import { GetLibraryEntryUseCase } from '../domain/usecases/get-library-entry.usecase';
import { GetLibraryMediaOptionsUseCase } from '../domain/usecases/get-library-media-options.usecase';
import { GetLibraryUseCase } from '../domain/usecases/get-library.usecase';
import { RemoveLibraryEntryUseCase } from '../domain/usecases/remove-library-entry.usecase';
import { UpdateLibraryEntryUseCase } from '../domain/usecases/update-library-entry.usecase';
import { LibraryMockDatasource } from '../infrastructure/datasources/library-mock.datasource';
import {
  LibraryCatalogRepositoryImpl,
  LibraryRepositoryImpl,
} from '../infrastructure/repositories/library.repository.impl';

/** TODO: replace this in-memory datasource with the shared HTTP adapter after Auth/Media contracts land. */
export function createLibraryContainer() {
  const datasource = new LibraryMockDatasource();
  const repository = new LibraryRepositoryImpl(datasource);
  const catalogRepository = new LibraryCatalogRepositoryImpl(datasource);

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
