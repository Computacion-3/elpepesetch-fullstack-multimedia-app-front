import { toDomainError } from '@/src/shared/infrastructure/error-translator';
import type { Role, RoleDraft } from '../../domain/entities/role';
import type { RolesRepository } from '../../domain/repositories/roles.repository';
import type { RolesDatasource } from '../datasources/roles.datasource';
import { RolesMapper } from '../mappers/roles.mapper';

export class RolesRepositoryImpl implements RolesRepository {
    constructor(private readonly datasource: RolesDatasource) {}

    async list(accessToken: string): Promise<Role[]> {
        try {
            return (await this.datasource.list(accessToken)).map(RolesMapper.toRole);
        } catch (err) {
            throw toDomainError(err);
        }
    }

    async get(accessToken: string, id: number): Promise<Role> {
        try {
            return RolesMapper.toRole(await this.datasource.get(accessToken, id));
        } catch (err) {
            throw toDomainError(err);
        }
    }

    async create(accessToken: string, draft: RoleDraft): Promise<Role> {
        try {
            return RolesMapper.toRole(await this.datasource.create(accessToken, RolesMapper.toRequest(draft)));
        } catch (err) {
            throw toDomainError(err);
        }
    }

    async update(accessToken: string, id: number, draft: RoleDraft): Promise<Role> {
        try {
            return RolesMapper.toRole(await this.datasource.update(accessToken, id, RolesMapper.toRequest(draft)));
        } catch (err) {
            throw toDomainError(err);
        }
    }

    async setPermissions(accessToken: string, id: number, permissionIds: number[]): Promise<Role> {
        try {
            return RolesMapper.toRole(await this.datasource.setPermissions(accessToken, id, { permissionIds }));
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
