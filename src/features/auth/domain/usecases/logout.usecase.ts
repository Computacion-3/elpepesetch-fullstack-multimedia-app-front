import type { AuthRepository } from '../repositories/auth.repository';

export class LogoutUseCase {
    constructor(private readonly repository: AuthRepository) {}

    /** Best effort: never throws, the local session is closed regardless. */
    async execute(accessToken: string): Promise<void> {
        try {
            await this.repository.logout(accessToken);
        } catch {
            /* token ya inválido: igual se cierra la sesión local */
        }
    }
}
