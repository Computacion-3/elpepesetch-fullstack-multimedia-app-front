import { assertValidLoginCredentials } from '../entities/user';
import type { LoginCredentials, User } from '../entities/user';
import type { AuthRepository } from '../repositories/auth.repository';

export class LoginUseCase {
    constructor(private readonly repository: AuthRepository) {}

    async execute(credentials: LoginCredentials): Promise<{ accessToken: string; user: User }> {
        assertValidLoginCredentials(credentials);
        const accessToken = await this.repository.login(credentials);
        const user = await this.repository.getCurrentUser(accessToken);
        return { accessToken, user };
    }
}
