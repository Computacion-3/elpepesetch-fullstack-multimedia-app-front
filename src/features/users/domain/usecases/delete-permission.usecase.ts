import type { PermissionsRepository } from '../repositories/permissions.repository';

export class DeletePermissionUseCase {
    constructor(private readonly repository: PermissionsRepository) {}

    async execute(accessToken: string, id: number): Promise<void> {
        await this.repository.remove(accessToken, id);
    }
}
