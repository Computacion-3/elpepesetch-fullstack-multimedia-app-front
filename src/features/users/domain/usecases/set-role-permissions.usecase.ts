import type { Role } from '../entities/role';
import type { RolesRepository } from '../repositories/roles.repository';

export class SetRolePermissionsUseCase {
    constructor(private readonly repository: RolesRepository) {}

    async execute(accessToken: string, id: number, permissionIds: number[]): Promise<Role> {
        return this.repository.setPermissions(accessToken, id, permissionIds);
    }
}
