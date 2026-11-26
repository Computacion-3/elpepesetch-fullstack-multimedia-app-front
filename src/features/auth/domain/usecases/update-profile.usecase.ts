import { assertValidProfileDraft } from '../entities/user';
import type { ProfileDraft, User } from '../entities/user';
import type { AuthRepository } from '../repositories/auth.repository';

/** Edita el perfil propio y devuelve el usuario actualizado (con rol y permisos). */
export class UpdateProfileUseCase {
    constructor(private readonly repository: AuthRepository) {}

    async execute(accessToken: string, draft: ProfileDraft): Promise<User> {
        assertValidProfileDraft(draft);
        await this.repository.updateProfile(accessToken, draft);
        return this.repository.getCurrentUser(accessToken);
    }
}
