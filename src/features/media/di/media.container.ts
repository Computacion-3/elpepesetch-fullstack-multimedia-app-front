import 'server-only';
import { createFetchHttpClient } from '@/src/shared/infrastructure/http-client';
import { CreateMediaItemUseCase } from '../domain/usecases/create-media-item.usecase';
import { GetMediaItemUseCase } from '../domain/usecases/get-media-item.usecase';
import { ListMediaUseCase } from '../domain/usecases/list-media.usecase';
import { ListPendingMediaUseCase } from '../domain/usecases/list-pending-media.usecase';
import { SetMediaItemApprovalUseCase } from '../domain/usecases/set-media-item-approval.usecase';
import { UpdateMediaItemUseCase } from '../domain/usecases/update-media-item.usecase';
import { MediaRestDatasource } from '../infrastructure/datasources/media-rest.datasource';
import { MediaRepositoryImpl } from '../infrastructure/repositories/media.repository.impl';

/** El backend solo publica Media por REST; este módulo no sigue el selector REST/GraphQL de Library. */
export function createMediaContainer() {
    const http = createFetchHttpClient();
    const datasource = new MediaRestDatasource(http);
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
