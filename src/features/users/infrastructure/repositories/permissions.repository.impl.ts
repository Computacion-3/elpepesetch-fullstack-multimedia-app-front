import { toDomainError } from '@/src/shared/infrastructure/error-translator';
import type { Permission, PermissionDraft } from '../../domain/entities/permission';
import type { PermissionsRepository } from '../../domain/repositories/permissions.repository';
import type { PermissionsDatasource } from '../datasources/permissions.datasource';
import { PermissionsMapper } from '../mappers/permissions.mapper';

export class PermissionsRepositoryImpl implements PermissionsRepository {
    constructor(private readonly datasource: PermissionsDatasource) {}

    async list(accessToken: string): Promise<Permission[]> {
        try {
            return (await this.datasource.list(accessToken)).map(PermissionsMapper.toPermission);
        } catch (err) {
            throw toDomainError(err);
        }
    }

    async create(accessToken: string, draft: PermissionDraft): Promise<Permission> {
        try {
            const dto = await this.datasource.create(accessToken, PermissionsMapper.toRequest(draft));
            return PermissionsMapper.toPermission(dto);
        } catch (err) {
            throw toDomainError(err);
        }
    }

    async update(accessToken: string, id: number, draft: PermissionDraft): Promise<Permission> {
        try {
            const dto = await this.datasource.update(accessToken, id, PermissionsMapper.toRequest(draft));
            return PermissionsMapper.toPermission(dto);
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
