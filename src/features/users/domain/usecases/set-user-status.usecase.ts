import type { UserAccount } from '../entities/user-account';
import type { UsersRepository } from '../repositories/users.repository';

export class SetUserStatusUseCase {
    constructor(private readonly repository: UsersRepository) {}

    async execute(accessToken: string, id: number, isActive: boolean): Promise<UserAccount> {
        return this.repository.setStatus(accessToken, id, isActive);
    }
}
