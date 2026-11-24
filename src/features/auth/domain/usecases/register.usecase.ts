import { assertValidRegisterDraft } from '../entities/user';
import type { RegisterDraft } from '../entities/user';
import type { AuthRepository } from '../repositories/auth.repository';

export class RegisterUseCase {
    constructor(private readonly repository: AuthRepository) {}

    async execute(draft: RegisterDraft): Promise<void> {
        assertValidRegisterDraft(draft);
        await this.repository.register(draft);
    }
}
