import { assertValidRoleDraft } from '../entities/role';
import type { Role, RoleDraft } from '../entities/role';
import type { RolesRepository } from '../repositories/roles.repository';

export class UpdateRoleUseCase {
    constructor(private readonly repository: RolesRepository) {}

    async execute(accessToken: string, id: number, draft: RoleDraft): Promise<Role> {
        assertValidRoleDraft(draft);
        return this.repository.update(accessToken, id, draft);
    }
}
