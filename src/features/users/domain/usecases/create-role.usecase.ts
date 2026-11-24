import { assertValidRoleDraft } from '../entities/role';
import type { Role, RoleDraft } from '../entities/role';
import type { RolesRepository } from '../repositories/roles.repository';

export class CreateRoleUseCase {
    constructor(private readonly repository: RolesRepository) {}

    async execute(accessToken: string, draft: RoleDraft): Promise<Role> {
        assertValidRoleDraft(draft);
        return this.repository.create(accessToken, draft);
    }
}
