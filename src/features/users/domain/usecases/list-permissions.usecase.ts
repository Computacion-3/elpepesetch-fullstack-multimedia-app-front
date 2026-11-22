import type { Permission } from '../entities/permission';
import type { PermissionsRepository } from '../repositories/permissions.repository';

export class ListPermissionsUseCase {
    constructor(private readonly repository: PermissionsRepository) {}

    async execute(accessToken: string): Promise<Permission[]> {
        return this.repository.list(accessToken);
    }
}
