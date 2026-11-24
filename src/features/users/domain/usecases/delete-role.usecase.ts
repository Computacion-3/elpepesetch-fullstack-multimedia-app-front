import type { RolesRepository } from '../repositories/roles.repository';

export class DeleteRoleUseCase {
    constructor(private readonly repository: RolesRepository) {}

    async execute(accessToken: string, id: number): Promise<void> {
        await this.repository.remove(accessToken, id);
    }
}
