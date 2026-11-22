import { assertValidPermissionDraft } from '../entities/permission';
import type { Permission, PermissionDraft } from '../entities/permission';
import type { PermissionsRepository } from '../repositories/permissions.repository';

export class CreatePermissionUseCase {
    constructor(private readonly repository: PermissionsRepository) {}

    async execute(accessToken: string, draft: PermissionDraft): Promise<Permission> {
        assertValidPermissionDraft(draft);
        return this.repository.create(accessToken, draft);
    }
}
