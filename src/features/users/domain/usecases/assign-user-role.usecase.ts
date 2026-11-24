import type { UserAccount } from '../entities/user-account';
import type { UsersRepository } from '../repositories/users.repository';

export class AssignUserRoleUseCase {
    constructor(private readonly repository: UsersRepository) {}

    async execute(accessToken: string, id: number, roleId: number): Promise<UserAccount> {
        return this.repository.assignRole(accessToken, id, roleId);
    }
}
