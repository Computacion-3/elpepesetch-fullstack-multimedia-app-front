import type { Role } from '../../domain/entities/role';

/** Plain, serializable role data for the UI. */
export interface RoleViewModel {
    id: number;
    name: string;
    description: string;
    permissionIds: number[];
    permissionCount: number;
}

export class RolesViewModelMapper {
    static toViewModel(role: Role): RoleViewModel {
        return {
            id: role.id,
            name: role.name,
            description: role.description,
            permissionIds: role.permissions.map((permission) => permission.id),
            permissionCount: role.permissionCount,
        };
    }
}
