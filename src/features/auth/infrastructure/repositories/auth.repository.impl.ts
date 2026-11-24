import { toDomainError } from '@/src/shared/infrastructure/error-translator';
import type { SocketTicket } from '../../domain/entities/socket-ticket';
import type { LoginCredentials, RegisterDraft, User } from '../../domain/entities/user';
import type { AuthRepository } from '../../domain/repositories/auth.repository';
import type { AuthDatasource } from '../datasources/auth.datasource';
import { AuthMapper } from '../mappers/auth.mapper';

export class AuthRepositoryImpl implements AuthRepository {
    constructor(private readonly datasource: AuthDatasource) {}

    async login(credentials: LoginCredentials): Promise<string> {
        try {
            const dto = await this.datasource.login({
                email: credentials.email,
                password: credentials.password,
            });
            return dto.accessToken;
        } catch (err) {
            throw toDomainError(err);
        }
    }

    async register(draft: RegisterDraft): Promise<void> {
        try {
            await this.datasource.register(AuthMapper.toRegisterRequest(draft));
        } catch (err) {
            throw toDomainError(err);
        }
    }

    async logout(accessToken: string): Promise<void> {
        try {
            await this.datasource.logout(accessToken);
        } catch (err) {
            throw toDomainError(err);
        }
    }

    async getCurrentUser(accessToken: string): Promise<User> {
        try {
            return AuthMapper.toUser(await this.datasource.me(accessToken));
        } catch (err) {
            throw toDomainError(err);
        }
    }

    async getSocketTicket(accessToken: string): Promise<SocketTicket> {
        try {
            return AuthMapper.toSocketTicket(await this.datasource.socketToken(accessToken));
        } catch (err) {
            throw toDomainError(err);
        }
    }
}
