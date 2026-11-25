import { AddLibraryEntryUseCase } from '../domain/usecases/add-library-entry.usecase';
import { GetLibraryEntryUseCase } from '../domain/usecases/get-library-entry.usecase';
import { GetLibraryUseCase } from '../domain/usecases/get-library.usecase';
import { RemoveLibraryEntryUseCase } from '../domain/usecases/remove-library-entry.usecase';
import { UpdateLibraryEntryUseCase } from '../domain/usecases/update-library-entry.usecase';
import type { GraphQLClient } from '../../../shared/infrastructure/graphql-client';
import { LibraryGraphQLDatasource } from '../infrastructure/datasources/library-graphql.datasource';
import { LibraryApiClient, LibraryHttpDatasource } from '../infrastructure/datasources/library-http.datasource';
import type { LibraryDatasource } from '../infrastructure/datasources/library.datasource';
import { LibraryRepositoryImpl } from '../infrastructure/repositories/library.repository.impl';
import { UnexpectedError } from '../../../shared/domain/errors';
import { getLibraryDataSourceMode } from '../infrastructure/datasources/library-data-source.factory';

export interface LibraryContainerOptions {
  libraryDatasource?: LibraryDatasource;
  httpClient?: LibraryApiClient;
  graphqlClient?: GraphQLClient;
  dataSource?: string;
}

export function createLibraryContainer(options: LibraryContainerOptions) {
  const datasource = options.libraryDatasource ?? createDatasource(options);
  const repository = new LibraryRepositoryImpl(datasource);

  return {
    getLibrary: new GetLibraryUseCase(repository),
    getLibraryEntry: new GetLibraryEntryUseCase(repository),
    addLibraryEntry: new AddLibraryEntryUseCase(repository),
    updateLibraryEntry: new UpdateLibraryEntryUseCase(repository),
    removeLibraryEntry: new RemoveLibraryEntryUseCase(repository),
  };
}

function createDatasource(options: LibraryContainerOptions): LibraryDatasource {
  const dataSource = getLibraryDataSourceMode(
    options.dataSource ?? process.env.NEXT_PUBLIC_DATA_SOURCE,
  );
  switch (dataSource) {
    case 'rest':
      if (!options.httpClient) throw new UnexpectedError('Library REST requiere el cliente HTTP compartido.');
      return new LibraryHttpDatasource(options.httpClient);
    case 'graphql':
      if (!options.graphqlClient) throw new UnexpectedError('Library GraphQL requiere el cliente GraphQL compartido.');
      return new LibraryGraphQLDatasource(options.graphqlClient);
  }
}

export type LibraryContainer = ReturnType<typeof createLibraryContainer>;
