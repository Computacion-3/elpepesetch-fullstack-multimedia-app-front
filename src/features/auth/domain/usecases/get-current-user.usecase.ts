import type { User } from '../entities/user';
import type { AuthRepository } from '../repositories/auth.repository';

export class GetCurrentUserUseCase {
    constructor(private readonly repository: AuthRepository) {}

    async execute(accessToken: string): Promise<User> {
        return this.repository.getCurrentUser(accessToken);
    }
}
