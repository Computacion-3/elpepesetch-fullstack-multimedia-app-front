import { assertValidUserChanges } from '../entities/user-account';
import type { UserAccount, UserChanges } from '../entities/user-account';
import type { UsersRepository } from '../repositories/users.repository';

export class UpdateUserUseCase {
    constructor(private readonly repository: UsersRepository) {}

    async execute(accessToken: string, id: number, changes: UserChanges): Promise<UserAccount> {
        assertValidUserChanges(changes);
        return this.repository.update(accessToken, id, changes);
    }
}
