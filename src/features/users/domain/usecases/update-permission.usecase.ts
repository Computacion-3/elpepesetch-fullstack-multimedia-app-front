import { assertValidPermissionDraft } from '../entities/permission';
import type { Permission, PermissionDraft } from '../entities/permission';
import type { PermissionsRepository } from '../repositories/permissions.repository';

export class UpdatePermissionUseCase {
    constructor(private readonly repository: PermissionsRepository) {}

    async execute(accessToken: string, id: number, draft: PermissionDraft): Promise<Permission> {
        assertValidPermissionDraft(draft);
        return this.repository.update(accessToken, id, draft);
    }
}
