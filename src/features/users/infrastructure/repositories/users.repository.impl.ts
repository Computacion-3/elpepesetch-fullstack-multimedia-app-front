import { toDomainError } from '@/src/shared/infrastructure/error-translator';
import type { Page } from '@/src/shared/domain/page';
import type { UserAccount, UserChanges, UserDraft, UserFilters } from '../../domain/entities/user-account';
import type { UsersRepository } from '../../domain/repositories/users.repository';
import type { UsersDatasource } from '../datasources/users.datasource';
import { UsersMapper } from '../mappers/users.mapper';

export class UsersRepositoryImpl implements UsersRepository {
    constructor(private readonly datasource: UsersDatasource) {}

    async list(accessToken: string, filters: UserFilters): Promise<Page<UserAccount>> {
        try {
            return UsersMapper.toPage(await this.datasource.list(accessToken, UsersMapper.toQueryString(filters)));
        } catch (err) {
            throw toDomainError(err);
        }
    }

    async create(accessToken: string, draft: UserDraft): Promise<UserAccount> {
        try {
            return UsersMapper.toAccount(
                await this.datasource.create(accessToken, UsersMapper.toCreateRequest(draft)),
            );
        } catch (err) {
            throw toDomainError(err);
        }
    }

    async update(accessToken: string, id: number, changes: UserChanges): Promise<UserAccount> {
        try {
            return UsersMapper.toAccount(
                await this.datasource.update(accessToken, id, UsersMapper.toUpdateRequest(changes)),
            );
        } catch (err) {
            throw toDomainError(err);
        }
    }

    async assignRole(accessToken: string, id: number, roleId: number): Promise<UserAccount> {
        try {
            return UsersMapper.toAccount(await this.datasource.assignRole(accessToken, id, roleId));
        } catch (err) {
            throw toDomainError(err);
        }
    }

    async setStatus(accessToken: string, id: number, isActive: boolean): Promise<UserAccount> {
        try {
            return UsersMapper.toAccount(await this.datasource.setStatus(accessToken, id, isActive));
        } catch (err) {
            throw toDomainError(err);
        }
    }

    async remove(accessToken: string, id: number): Promise<void> {
        try {
            await this.datasource.remove(accessToken, id);
        } catch (err) {
            throw toDomainError(err);
        }
    }
}
