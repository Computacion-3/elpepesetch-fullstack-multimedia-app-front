import type { Role } from '../entities/role';
import type { RolesRepository } from '../repositories/roles.repository';

export class ListRolesUseCase {
    constructor(private readonly repository: RolesRepository) {}

    async execute(accessToken: string): Promise<Role[]> {
        return this.repository.list(accessToken);
    }
}
