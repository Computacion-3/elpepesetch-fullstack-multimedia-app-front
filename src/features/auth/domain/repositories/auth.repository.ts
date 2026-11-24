import type { SocketTicket } from '../entities/socket-ticket';
import type { LoginCredentials, RegisterDraft, User } from '../entities/user';

/** Contract the data layer must fulfil. */
export interface AuthRepository {
    /** Resolves to the access token (JWT). */
    login(credentials: LoginCredentials): Promise<string>;
    register(draft: RegisterDraft): Promise<void>;
    logout(accessToken: string): Promise<void>;
    getCurrentUser(accessToken: string): Promise<User>;
    /** Ticket de un solo uso para el handshake del WebSocket. */
    getSocketTicket(accessToken: string): Promise<SocketTicket>;
}
