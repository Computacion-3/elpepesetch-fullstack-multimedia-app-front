import type { Page } from '@/src/shared/domain/page';
import type { UserAccount, UserFilters } from '../entities/user-account';
import type { UsersRepository } from '../repositories/users.repository';

export class ListUsersUseCase {
    constructor(private readonly repository: UsersRepository) {}

    async execute(accessToken: string, filters: UserFilters): Promise<Page<UserAccount>> {
        return this.repository.list(accessToken, filters);
    }
}
