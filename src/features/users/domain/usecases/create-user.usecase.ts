import { assertValidUserDraft } from '../entities/user-account';
import type { UserAccount, UserDraft } from '../entities/user-account';
import type { UsersRepository } from '../repositories/users.repository';

export class CreateUserUseCase {
    constructor(private readonly repository: UsersRepository) {}

    async execute(accessToken: string, draft: UserDraft): Promise<UserAccount> {
        assertValidUserDraft(draft);
        return this.repository.create(accessToken, draft);
    }
}
