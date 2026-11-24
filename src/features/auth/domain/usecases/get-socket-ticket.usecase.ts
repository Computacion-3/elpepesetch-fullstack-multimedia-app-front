import type { SocketTicket } from '../entities/socket-ticket';
import type { AuthRepository } from '../repositories/auth.repository';

/** Pide al backend un ticket para abrir (o reabrir) la conexión de tiempo real. */
export class GetSocketTicketUseCase {
    constructor(private readonly repository: AuthRepository) {}

    async execute(accessToken: string): Promise<SocketTicket> {
        return this.repository.getSocketTicket(accessToken);
    }
}
