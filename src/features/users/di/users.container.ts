import 'server-only';
import { createFetchHttpClient } from '@/src/shared/infrastructure/http-client';
import { AssignUserRoleUseCase } from '../domain/usecases/assign-user-role.usecase';
import { CreatePermissionUseCase } from '../domain/usecases/create-permission.usecase';
import { CreateRoleUseCase } from '../domain/usecases/create-role.usecase';
import { CreateUserUseCase } from '../domain/usecases/create-user.usecase';
import { DeletePermissionUseCase } from '../domain/usecases/delete-permission.usecase';
import { DeleteRoleUseCase } from '../domain/usecases/delete-role.usecase';
import { DeleteUserUseCase } from '../domain/usecases/delete-user.usecase';
import { GetRoleUseCase } from '../domain/usecases/get-role.usecase';
import { ListPermissionsUseCase } from '../domain/usecases/list-permissions.usecase';
import { ListRolesUseCase } from '../domain/usecases/list-roles.usecase';
import { ListUsersUseCase } from '../domain/usecases/list-users.usecase';
import { SetRolePermissionsUseCase } from '../domain/usecases/set-role-permissions.usecase';
import { SetUserStatusUseCase } from '../domain/usecases/set-user-status.usecase';
import { UpdatePermissionUseCase } from '../domain/usecases/update-permission.usecase';
import { UpdateRoleUseCase } from '../domain/usecases/update-role.usecase';
import { UpdateUserUseCase } from '../domain/usecases/update-user.usecase';
import { PermissionsRestDatasource } from '../infrastructure/datasources/permissions-rest.datasource';
import { RolesRestDatasource } from '../infrastructure/datasources/roles-rest.datasource';
import { UsersRestDatasource } from '../infrastructure/datasources/users-rest.datasource';
import { PermissionsRepositoryImpl } from '../infrastructure/repositories/permissions.repository.impl';
import { RolesRepositoryImpl } from '../infrastructure/repositories/roles.repository.impl';
import { UsersRepositoryImpl } from '../infrastructure/repositories/users.repository.impl';

/**
 * Composition root of the feature: the ONLY place that knows concrete classes.
 */
export function createUsersContainer() {
    const http = createFetchHttpClient();
    const usersRepository = new UsersRepositoryImpl(new UsersRestDatasource(http));
    const rolesRepository = new RolesRepositoryImpl(new RolesRestDatasource(http));
    const permissionsRepository = new PermissionsRepositoryImpl(
        new PermissionsRestDatasource(http),
    );

    return {
        users: {
            list: new ListUsersUseCase(usersRepository),
            create: new CreateUserUseCase(usersRepository),
            update: new UpdateUserUseCase(usersRepository),
            assignRole: new AssignUserRoleUseCase(usersRepository),
            setStatus: new SetUserStatusUseCase(usersRepository),
            remove: new DeleteUserUseCase(usersRepository),
        },
        roles: {
            list: new ListRolesUseCase(rolesRepository),
            get: new GetRoleUseCase(rolesRepository),
            create: new CreateRoleUseCase(rolesRepository),
            update: new UpdateRoleUseCase(rolesRepository),
            setPermissions: new SetRolePermissionsUseCase(rolesRepository),
            remove: new DeleteRoleUseCase(rolesRepository),
        },
        permissions: {
            list: new ListPermissionsUseCase(permissionsRepository),
            create: new CreatePermissionUseCase(permissionsRepository),
            update: new UpdatePermissionUseCase(permissionsRepository),
            remove: new DeletePermissionUseCase(permissionsRepository),
        },
    };
}

export const usersContainer = createUsersContainer();

export type UsersContainer = ReturnType<typeof createUsersContainer>;
