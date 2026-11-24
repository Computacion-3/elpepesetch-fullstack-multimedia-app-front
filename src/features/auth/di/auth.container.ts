import 'server-only';
import { createFetchHttpClient } from '@/src/shared/infrastructure/http-client';
import { GetCurrentUserUseCase } from '../domain/usecases/get-current-user.usecase';
import { GetSocketTicketUseCase } from '../domain/usecases/get-socket-ticket.usecase';
import { LoginUseCase } from '../domain/usecases/login.usecase';
import { LogoutUseCase } from '../domain/usecases/logout.usecase';
import { RegisterUseCase } from '../domain/usecases/register.usecase';
import type { AuthDatasource } from '../infrastructure/datasources/auth.datasource';
import { AuthGraphQLDatasource } from '../infrastructure/datasources/auth-graphql.datasource';
import { AuthRestDatasource } from '../infrastructure/datasources/auth-rest.datasource';
import { AuthRepositoryImpl } from '../infrastructure/repositories/auth.repository.impl';

/**
 * Composition root of the feature: the ONLY place that knows concrete classes.
 * Switch implementations with NEXT_PUBLIC_DATA_SOURCE=rest|graphql (default: rest).
 */
export function createAuthContainer() {
    const http = createFetchHttpClient();
    const datasource: AuthDatasource =
        process.env.NEXT_PUBLIC_DATA_SOURCE === 'graphql'
            ? new AuthGraphQLDatasource(http)
            : new AuthRestDatasource(http);
    const repository = new AuthRepositoryImpl(datasource);

    return {
        login: new LoginUseCase(repository),
        register: new RegisterUseCase(repository),
        logout: new LogoutUseCase(repository),
        getCurrentUser: new GetCurrentUserUseCase(repository),
        getSocketTicket: new GetSocketTicketUseCase(repository),
    };
}

export const authContainer = createAuthContainer();

export type AuthContainer = ReturnType<typeof createAuthContainer>;
