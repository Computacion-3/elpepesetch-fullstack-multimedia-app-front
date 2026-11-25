import 'server-only';
import { createFetchHttpClient } from '@/src/shared/infrastructure/http-client';
import { createGraphQLClient } from '@/src/shared/infrastructure/graphql-client';
import { CreateMediaItemUseCase } from '../domain/usecases/create-media-item.usecase';
import { GetMediaItemUseCase } from '../domain/usecases/get-media-item.usecase';
import { ListMediaUseCase } from '../domain/usecases/list-media.usecase';
import { ListPendingMediaUseCase } from '../domain/usecases/list-pending-media.usecase';
import { SetMediaItemApprovalUseCase } from '../domain/usecases/set-media-item-approval.usecase';
import { UpdateMediaItemUseCase } from '../domain/usecases/update-media-item.usecase';
import type { MediaDatasource } from '../infrastructure/datasources/media.datasource';
import { MediaGraphQLDatasource } from '../infrastructure/datasources/media-graphql.datasource';
import { MediaRestDatasource } from '../infrastructure/datasources/media-rest.datasource';
import { MediaRepositoryImpl } from '../infrastructure/repositories/media.repository.impl';

/** Composición del módulo; NEXT_PUBLIC_DATA_SOURCE selecciona transporte y REST es el valor seguro. */
export function createMediaContainer() {
    const http = createFetchHttpClient();
    const graphql = createGraphQLClient(http);
    const datasource: MediaDatasource = process.env.NEXT_PUBLIC_DATA_SOURCE === 'graphql'
        ? new MediaGraphQLDatasource(graphql)
        : new MediaRestDatasource(http);
    const repository = new MediaRepositoryImpl(datasource);

    return {
        list: new ListMediaUseCase(repository),
        listPending: new ListPendingMediaUseCase(repository),
        getById: new GetMediaItemUseCase(repository),
        create: new CreateMediaItemUseCase(repository),
        update: new UpdateMediaItemUseCase(repository),
        setApproval: new SetMediaItemApprovalUseCase(repository),
    };
}

/** Instancia server-only consumida por Server Actions. */
export const mediaContainer = createMediaContainer();

/** Tipos de los casos de uso expuestos para la inyección en Server Actions. */
export type MediaContainer = ReturnType<typeof createMediaContainer>;
