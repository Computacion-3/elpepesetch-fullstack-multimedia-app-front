import type { Permission } from '../../domain/entities/permission';

/** Plain, serializable permission data for the UI. */
export interface PermissionViewModel {
    id: number;
    name: string;
    description: string;
}

export class PermissionsViewModelMapper {
    static toViewModel(permission: Permission): PermissionViewModel {
        return {
            id: permission.id,
            name: permission.name,
            description: permission.description,
        };
    }
}
