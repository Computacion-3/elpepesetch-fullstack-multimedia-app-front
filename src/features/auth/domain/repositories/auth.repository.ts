import type { LoginCredentials, RegisterDraft, User } from '../entities/user';

/** Contract the data layer must fulfil. */
export interface AuthRepository {
    /** Resolves to the access token (JWT). */
    login(credentials: LoginCredentials): Promise<string>;
    register(draft: RegisterDraft): Promise<void>;
    logout(accessToken: string): Promise<void>;
    getCurrentUser(accessToken: string): Promise<User>;
}
