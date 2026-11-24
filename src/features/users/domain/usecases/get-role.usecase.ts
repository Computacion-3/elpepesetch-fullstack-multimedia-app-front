import type { Role } from '../entities/role';
import type { RolesRepository } from '../repositories/roles.repository';

export class GetRoleUseCase {
    constructor(private readonly repository: RolesRepository) {}

    async execute(accessToken: string, id: number): Promise<Role> {
        return this.repository.get(accessToken, id);
    }
}
