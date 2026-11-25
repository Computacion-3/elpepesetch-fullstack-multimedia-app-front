import 'server-only';
import { createFetchHttpClient } from '@/src/shared/infrastructure/http-client';
import { createGraphQLClient } from '@/src/shared/infrastructure/graphql-client';
import { CreateGenreUseCase } from '../domain/usecases/create-genre.usecase';
import { DeleteGenreUseCase } from '../domain/usecases/delete-genre.usecase';
import { ListGenresUseCase } from '../domain/usecases/list-genres.usecase';
import { UpdateGenreUseCase } from '../domain/usecases/update-genre.usecase';
import type { GenresDatasource } from '../infrastructure/datasources/genres.datasource';
import { GenresGraphQLDatasource } from '../infrastructure/datasources/genres-graphql.datasource';
import { GenresRestDatasource } from '../infrastructure/datasources/genres-rest.datasource';
import { GenresRepositoryImpl } from '../infrastructure/repositories/genres.repository.impl';

/** Composición de géneros con el selector dual compartido con autenticación. */
export function createGenresContainer() {
    const http = createFetchHttpClient();
    const graphql = createGraphQLClient(http);
    const datasource: GenresDatasource = process.env.NEXT_PUBLIC_DATA_SOURCE === 'graphql'
        ? new GenresGraphQLDatasource(graphql)
        : new GenresRestDatasource(http);
    const repository = new GenresRepositoryImpl(datasource);

    return {
        list: new ListGenresUseCase(repository),
        create: new CreateGenreUseCase(repository),
        update: new UpdateGenreUseCase(repository),
        delete: new DeleteGenreUseCase(repository),
    };
}

/** Instancia server-only consumida por Server Actions. */
export const genresContainer = createGenresContainer();

/** Tipos de los casos de uso expuestos para la inyección en Server Actions. */
export type GenresContainer = ReturnType<typeof createGenresContainer>;
